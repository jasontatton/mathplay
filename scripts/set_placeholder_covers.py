"""
Set all books to use a nice book icon placeholder.
Since neither OpenLibrary nor Google Books covers are working reliably,
we'll use a simple, clean placeholder.
"""
import json

# Use a nice book icon from a reliable CDN
PLACEHOLDER_URL = "https://placehold.co/400x600/e8f4f8/1e3a8a?text=Book+Cover&font=roboto"

def main():
    with open('../src/games/english/book_metadata_y5.json', 'r', encoding='utf-8') as f:
        books = json.load(f)

    print(f"Setting placeholder covers for {len(books)} books...")

    for book in books:
        book['image_url'] = PLACEHOLDER_URL

    with open('../src/games/english/book_metadata_y5.json', 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)

    print(f"✅ All books now use placeholder cover")
    print(f"✅ Updated: ../src/games/english/book_metadata_y5.json")
    print(f"\nNote: Book covers from OpenLibrary/Google Books are currently unavailable.")
    print(f"The reading list will display with a clean placeholder icon for now.")

if __name__ == "__main__":
    main()
