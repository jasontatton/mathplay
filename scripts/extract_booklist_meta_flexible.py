import argparse
import json
import time
import urllib.parse
from pathlib import Path

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from tqdm import tqdm

AFFILIATE_TAG = "jtatton-21"  # Amazon Associates tag

# Rate limiting delays (seconds)
DELAY_BETWEEN_REQUESTS = 0.5
DELAY_AFTER_ERROR = 2.0


def create_session():
    """Create a requests session with retry logic."""
    session = requests.Session()
    retries = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"]
    )
    adapter = HTTPAdapter(max_retries=retries)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


def google_books_search(title: str, author: str, isbn: str, session):
    """Query Google Books API and return a dict or None."""
    try:
        urls = []

        if isbn:
            urls.append(f"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}")

        urls.append(f"https://www.googleapis.com/books/v1/volumes?q={urllib.parse.quote(f'{title} {author}')}")

        data = None
        for url in urls:
            try:
                time.sleep(DELAY_BETWEEN_REQUESTS)
                resp = session.get(url, timeout=10)
                if resp.status_code != 200:
                    continue
                data = resp.json()
                if "items" in data and len(data["items"]) > 0:
                    break
            except Exception as e:
                print(f"  Google Books error for {title}: {e}")
                continue

        if not data or "items" not in data or len(data["items"]) == 0:
            return None

        # Try to pick the best match (exact title/author match)
        best_item = None
        for item in data["items"]:
            info = item.get("volumeInfo", {})
            book_title = info.get("title", "").lower()
            authors = [a.lower() for a in info.get("authors", [])]
            if title.lower() in book_title and author.lower() in " ".join(authors):
                best_item = item
                break
        if not best_item:
            best_item = data["items"][0]  # fallback to first

        info = best_item.get("volumeInfo", {})
        image_url = info.get("imageLinks", {}).get("thumbnail", None)
        synopsis = info.get("description", "")

        # Prefer ISBN-13 if available
        found_isbn = None
        isbn10 = None
        for id_obj in info.get("industryIdentifiers", []):
            if id_obj["type"] == "ISBN_13" and not found_isbn:
                found_isbn = id_obj["identifier"]
            elif id_obj["type"] == "ISBN_10":
                isbn10 = id_obj["identifier"]
        if not found_isbn and isbn10:
            found_isbn = isbn10  # fallback

        return {
            "title": info.get("title", title),
            "authors": info.get("authors", [author]),
            "image_url": image_url,
            "synopsis": synopsis,
            "isbn": found_isbn
        }
    except Exception as e:
        print(f"  Google Books failed for {title}: {e}")
        return None


def openlibrary_lookup(title, author, session):
    """Fallback search in Open Library."""
    try:
        query = f"{title} {author}"
        url = f"https://openlibrary.org/search.json?q={urllib.parse.quote(query)}"
        time.sleep(DELAY_BETWEEN_REQUESTS)
        resp = session.get(url, timeout=10)
        if resp.status_code != 200:
            return None
        data = resp.json()
        if "docs" not in data or len(data["docs"]) == 0:
            return None

        doc = data["docs"][0]
        isbn = None
        if "isbn" in doc and len(doc["isbn"]) > 0:
            # Prefer ISBN-13 if available
            isbn13s = [i for i in doc["isbn"] if len(i) == 13]
            isbn = isbn13s[0] if isbn13s else doc["isbn"][0]
        image_url = None
        if isbn:
            image_url = f"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg"

        synopsis = doc.get("first_sentence", [""])[0] if isinstance(doc.get("first_sentence", ""), list) else doc.get(
            "first_sentence", "")

        return {
            "title": doc.get("title", title),
            "authors": doc.get("author_name", [author]),
            "image_url": image_url,
            "synopsis": synopsis,
            "isbn": isbn
        }
    except Exception as e:
        print(f"  OpenLibrary failed for {title}: {e}")
        return None


def build_link(isbn):
    if isbn:
        return f'https://www.google.co.uk/books?vid=ISBN{isbn}'
    return 'https://books.google.co.uk/'


def get_book_metadata(title, author, isbn, session):
    """Get book metadata with error handling and fallbacks."""
    image_url = synopsis = found_isbn = None

    # Try Google Books first
    try:
        gb = google_books_search(title, author, isbn, session)
        if gb:
            image_url = gb["image_url"]
            found_isbn = gb["isbn"] or isbn
            synopsis = gb["synopsis"]
    except Exception as e:
        print(f"  Error in Google Books for {title}: {e}")
        time.sleep(DELAY_AFTER_ERROR)

    # Fallback to Open Library if needed
    if not image_url or not found_isbn:
        try:
            ol = openlibrary_lookup(title, author, session)
            if ol:
                if not image_url:
                    image_url = ol["image_url"]
                if not found_isbn:
                    found_isbn = ol["isbn"] or isbn
                if not synopsis:
                    synopsis = ol["synopsis"]
        except Exception as e:
            print(f"  Error in OpenLibrary for {title}: {e}")
            time.sleep(DELAY_AFTER_ERROR)

    link = build_link(found_isbn)

    return {
        "title": title,
        "author": author,
        "image_url": image_url,
        "synopsis": synopsis or "",
        "isbn": found_isbn,
        "link": link,
    }


def main():
    parser = argparse.ArgumentParser(description='Extract book metadata for a given year')
    parser.add_argument('--year', type=str, default='y4', help='Year level (e.g., y4, y5, y6)')
    parser.add_argument('--resume', action='store_true', help='Resume from progress file')
    args = parser.parse_args()

    year = args.year
    input_file = f"./books_{year}.txt" if year != "y4" else "./books.txt"
    output_json = f"../src/games/english/book_metadata_{year}.json" if year != "y4" else "../src/games/english/book_metadata.json"
    output_txt = f"./books_{year}.txt" if year != "y4" else "./books.txt"
    progress_file = f"./progress_{year}.json"

    print(f"Processing {year.upper()} reading list...")
    print(f"Input file: {input_file}")
    print(f"Output JSON: {output_json}")
    print(f"Rate limit: {DELAY_BETWEEN_REQUESTS}s between requests\n")

    books = []
    with open(input_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue  # skip empty lines and comments
            parts = line.split(",")
            if len(parts) >= 2:
                author = parts[0].strip()
                title = parts[1].strip()
                isbn = parts[2].strip() if len(parts) >= 3 else None
                books.append((author, title, isbn))
            else:
                print(f"Skipping malformed line: {line}")

    if not books:
        print(f"No books found in {input_file}. Please add books in the format: Author, Title, ISBN (optional)")
        return

    # Load progress if resuming
    results = []
    start_idx = 0
    if args.resume and Path(progress_file).exists():
        with open(progress_file, 'r', encoding='utf-8') as f:
            progress = json.load(f)
            results = progress.get('results', [])
            start_idx = progress.get('last_index', 0)
            print(f"Resuming from book {start_idx + 1}/{len(books)}\n")

    session = create_session()
    failed = []

    try:
        for idx, (author, title, isbn) in enumerate(tqdm(books[start_idx:],
                                                          desc="Extract metadata",
                                                          initial=start_idx,
                                                          total=len(books),
                                                          colour="green")):
            actual_idx = start_idx + idx

            try:
                info = get_book_metadata(title, author, isbn, session)
                if info['isbn'] is not None:
                    results.append(info)
                else:
                    failed.append((author, title))
                    print(f"\n⚠️  No ISBN found: {author} - {title}")

                # Save progress every 10 books
                if (actual_idx + 1) % 10 == 0:
                    with open(progress_file, 'w', encoding='utf-8') as f:
                        json.dump({'results': results, 'last_index': actual_idx + 1}, f)

            except Exception as e:
                failed.append((author, title))
                print(f"\n❌ Failed on: {author} - {title}: {e}")
                time.sleep(DELAY_AFTER_ERROR)
                continue

    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted! Saving progress...")
        with open(progress_file, 'w', encoding='utf-8') as f:
            json.dump({'results': results, 'last_index': actual_idx + 1}, f)
        print(f"Progress saved to {progress_file}")
        print(f"Resume with: python {Path(__file__).name} --year {year} --resume")
        return

    # Save final results
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    # Clean up progress file
    if Path(progress_file).exists():
        Path(progress_file).unlink()

    print(f"\n✅ Success! {len(results)}/{len(books)} books processed")

    if failed:
        print(f"\n⚠️  {len(failed)} books failed (no ISBN found):")
        for author, title in failed[:10]:
            print(f"   - {author}: {title}")
        if len(failed) > 10:
            print(f"   ... and {len(failed) - 10} more")

        # Save failed books to a file for manual review
        failed_file = f"./failed_{year}.txt"
        with open(failed_file, 'w', encoding='utf-8') as f:
            for author, title in failed:
                f.write(f"{author}, {title}\n")
        print(f"\nFailed books saved to: {failed_file}")


if __name__ == "__main__":
    main()
