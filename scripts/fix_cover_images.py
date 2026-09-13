"""
Fix cover images by using Google Books covers instead of OpenLibrary.
Google Books covers are fetched directly from books.google.com (not the API).
"""
import json

def get_google_books_cover_url(isbn):
    """Get Google Books cover image URL"""
    # Google Books provides covers via this direct URL format (no API needed)
    return f"https://books.google.com/books/publisher/content/images/frontcover/{isbn}?fife=w400-h600&source=gbs_api"

def main():
    print("Updating cover images to use Google Books...")

    with open('../src/games/english/book_metadata_y5.json', 'r', encoding='utf-8') as f:
        books = json.load(f)

    # Backup
    with open('../src/games/english/book_metadata_y5_backup.json', 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)

    print(f"Processing {len(books)} books...\n")

    for book in books:
        isbn = book['isbn']
        old_url = book['image_url']

        # Update to Google Books cover
        book['image_url'] = get_google_books_cover_url(isbn)

        print(f"✅ {book['title'][:50]}")

    with open('../src/games/english/book_metadata_y5.json', 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)

    print(f"\n✅ All {len(books)} book covers updated to Google Books")
    print(f"Backup: ../src/games/english/book_metadata_y5_backup.json")

if __name__ == "__main__":
    main()
