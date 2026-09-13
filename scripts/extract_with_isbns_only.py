"""
Extract book metadata using ISBNs directly - bypasses Google Books API.
Uses OpenLibrary API which is more forgiving, and direct ISBN cover links.
"""
import argparse
import json
import time
from pathlib import Path

import requests
from tqdm import tqdm


def get_openlibrary_data(isbn):
    """Get data from OpenLibrary using ISBN"""
    try:
        # OpenLibrary ISBN endpoint
        url = f"https://openlibrary.org/isbn/{isbn}.json"
        resp = requests.get(url, timeout=10)

        if resp.status_code == 200:
            data = resp.json()
            return {
                "title": data.get("title"),
                "description": data.get("description", {}).get("value") if isinstance(data.get("description"), dict) else data.get("description"),
                "publishers": data.get("publishers", []),
                "publish_date": data.get("publish_date"),
            }
    except Exception as e:
        pass

    # Fallback: search by ISBN
    try:
        url = f"https://openlibrary.org/search.json?isbn={isbn}"
        time.sleep(0.3)
        resp = requests.get(url, timeout=10)

        if resp.status_code == 200:
            data = resp.json()
            if "docs" in data and len(data["docs"]) > 0:
                doc = data["docs"][0]
                return {
                    "title": doc.get("title"),
                    "description": doc.get("first_sentence", [None])[0] if isinstance(doc.get("first_sentence"), list) else doc.get("first_sentence"),
                    "publishers": doc.get("publisher", []),
                    "publish_date": doc.get("publish_date", [None])[0] if isinstance(doc.get("publish_date"), list) else doc.get("publish_date"),
                }
    except Exception as e:
        pass

    return None


def create_book_entry(author, title, isbn):
    """Create a book entry with all available data"""

    # Image URLs - OpenLibrary provides free cover images by ISBN
    image_url = f"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg"

    # Try to get additional data from OpenLibrary
    synopsis = ""
    ol_data = get_openlibrary_data(isbn)

    if ol_data:
        # Use OpenLibrary description if available
        if ol_data.get("description"):
            synopsis = ol_data.get("description", "")
            # Clean up if it's too long
            if len(synopsis) > 500:
                synopsis = synopsis[:500] + "..."

    # If no synopsis, create a generic one
    if not synopsis:
        synopsis = f"A recommended book for Year 5 readers by {author}."

    return {
        "title": title,
        "author": author,
        "isbn": isbn,
        "image_url": image_url,
        "synopsis": synopsis,
        "link": f"https://www.google.co.uk/books?vid=ISBN{isbn}"
    }


def main():
    parser = argparse.ArgumentParser(description='Extract book metadata using ISBNs')
    parser.add_argument('--year', type=str, default='y5', help='Year level (e.g., y4, y5, y6)')
    parser.add_argument('--delay', type=float, default=0.5, help='Delay between requests (seconds)')
    args = parser.parse_args()

    year = args.year
    input_file = f"./books_{year}.txt" if year != "y4" else "./books.txt"
    output_json = f"../src/games/english/book_metadata_{year}.json" if year != "y4" else "../src/games/english/book_metadata.json"

    print(f"Processing {year.upper()} reading list with ISBNs...")
    print(f"Input file: {input_file}")
    print(f"Output JSON: {output_json}")
    print(f"Rate limit: {args.delay}s between requests\n")

    # Read books with ISBNs
    books = []
    with open(input_file, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line or line.startswith('#'):
                continue

            parts = [p.strip() for p in line.split(',')]
            if len(parts) >= 3:
                author, title, isbn = parts[0], parts[1], parts[2]
                # Clean ISBN (remove hyphens)
                isbn = isbn.replace('-', '')
                books.append((author, title, isbn))
            else:
                print(f"⚠️  Line {line_num}: Missing ISBN - {line}")

    if not books:
        print(f"❌ No books with ISBNs found in {input_file}")
        return

    print(f"Found {len(books)} books with ISBNs\n")

    results = []
    failed = []

    for author, title, isbn in tqdm(books, desc="Processing books", colour="green"):
        try:
            entry = create_book_entry(author, title, isbn)
            results.append(entry)
            time.sleep(args.delay)  # Rate limiting

        except Exception as e:
            print(f"\n❌ Error processing {author} - {title}: {e}")
            failed.append((author, title, isbn))
            time.sleep(1)

    # Save results
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"✅ Success! Processed {len(results)}/{len(books)} books")
    print(f"{'='*60}")
    print(f"Output: {output_json}")

    if failed:
        print(f"\n⚠️  {len(failed)} books had errors:")
        for author, title, isbn in failed[:5]:
            print(f"   - {author}: {title} (ISBN: {isbn})")
        if len(failed) > 5:
            print(f"   ... and {len(failed) - 5} more")

    print(f"\nNext steps:")
    print(f"1. Test the UI: npm start")
    print(f"2. Navigate to: /enlgish/{year}readingList")
    print(f"3. Book covers will load from OpenLibrary")


if __name__ == "__main__":
    main()
