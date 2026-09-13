"""
Download actual book covers and save them locally.
Tries multiple sources: OpenLibrary, Google Books, Amazon, etc.
"""
import json
import time
import os
import requests
from tqdm import tqdm

def download_cover(isbn, title, author, output_dir):
    """Try to download a real book cover from multiple sources"""

    # List of URLs to try in order
    sources = [
        # OpenLibrary - different sizes in case L is down
        (f"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg", "openlibrary-L"),
        (f"https://covers.openlibrary.org/b/isbn/{isbn}-M.jpg", "openlibrary-M"),

        # Google Books - try different formats
        (f"http://books.google.com/books/content?id=ISBN:{isbn}&printsec=frontcover&img=1&zoom=1", "google-1"),
        (f"http://books.google.com/books/content?id={isbn}&printsec=frontcover&img=1&zoom=5", "google-5"),

        # Alternative: try without ISBN prefix
        (f"http://books.google.com/books/content?id={isbn}&printsec=frontcover&img=1&zoom=1&source=gbs_api", "google-api"),
    ]

    output_path = os.path.join(output_dir, f"{isbn}.jpg")

    # If already downloaded, skip
    if os.path.exists(output_path):
        file_size = os.path.getsize(output_path)
        if file_size > 2000:  # If it's a decent size, assume it's good
            return output_path, "already_exists"

    for url, source in sources:
        try:
            time.sleep(0.3)  # Be polite
            resp = requests.get(url, timeout=10, allow_redirects=True)

            if resp.status_code == 200:
                # Check if it's actually an image and not a tiny placeholder
                content_type = resp.headers.get('content-type', '')
                content_length = len(resp.content)

                if 'image' in content_type and content_length > 2000:
                    # Save the image
                    with open(output_path, 'wb') as f:
                        f.write(resp.content)
                    return output_path, source

        except Exception as e:
            continue

    return None, "not_found"


def main():
    print("Downloading book covers...\n")

    # Load metadata
    with open('../src/games/english/book_metadata_y5.json', 'r', encoding='utf-8') as f:
        books = json.load(f)

    output_dir = '../public/book-covers'
    os.makedirs(output_dir, exist_ok=True)

    print(f"Output directory: {output_dir}")
    print(f"Books to process: {len(books)}\n")

    # Track statistics
    stats = {
        'downloaded': 0,
        'already_exists': 0,
        'not_found': 0
    }
    failed_books = []

    # Download covers
    for book in tqdm(books, desc="Downloading covers", colour="blue"):
        isbn = book['isbn']
        title = book['title']
        author = book['author']

        path, status = download_cover(isbn, title, author, output_dir)

        if path:
            # Update metadata to use local file
            book['image_url'] = f"/mathplay/book-covers/{isbn}.jpg"

            if status == "already_exists":
                stats['already_exists'] += 1
            else:
                stats['downloaded'] += 1
                tqdm.write(f"✅ {title} ({status})")
        else:
            stats['not_found'] += 1
            failed_books.append((author, title, isbn))
            tqdm.write(f"⚠️  Not found: {title}")
            # Keep placeholder for now
            book['image_url'] = f"/mathplay/book-covers/placeholder.jpg"

    # Save updated metadata
    with open('../src/games/english/book_metadata_y5.json', 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)

    # Results
    print(f"\n{'='*60}")
    print(f"Results:")
    print(f"{'='*60}")
    print(f"✅ Downloaded:      {stats['downloaded']}")
    print(f"⏭️  Already exists:  {stats['already_exists']}")
    print(f"⚠️  Not found:       {stats['not_found']}")
    print(f"\nTotal covers available: {stats['downloaded'] + stats['already_exists']}/{len(books)}")

    if failed_books:
        print(f"\nBooks without covers:")
        for author, title, isbn in failed_books[:20]:
            print(f"  - {author}: {title} (ISBN: {isbn})")
        if len(failed_books) > 20:
            print(f"  ... and {len(failed_books) - 20} more")

    print(f"\n✅ Metadata updated: ../src/games/english/book_metadata_y5.json")
    print(f"✅ Covers saved to: {output_dir}")


if __name__ == "__main__":
    main()
