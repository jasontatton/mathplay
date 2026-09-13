"""
Since we can't get real cover images reliably without API access,
let's use a combination of:
1. A nice book icon placeholder
2. Or just remove the image and let the UI handle it gracefully
"""
import json

def main():
    print("Options for handling missing cover images:\n")
    print("1. Use a generic book icon placeholder")
    print("2. Set image_url to null (UI can show title/author card)")
    print("3. Try OpenLibrary again (it was 503 earlier)")
    print("4. Keep current URLs and let them show placeholder")

    with open('../src/games/english/book_metadata_y5.json', 'r', encoding='utf-8') as f:
        books = json.load(f)

    # Option: Use a nice book placeholder icon
    placeholder_url = "https://via.placeholder.com/400x600/4A90E2/FFFFFF?text=Book+Cover"

    choice = input("\nWhich option? (1-4): ").strip()

    if choice == "1":
        for book in books:
            book['image_url'] = placeholder_url
        print(f"✅ Set all books to use placeholder icon")

    elif choice == "2":
        for book in books:
            book['image_url'] = None
        print(f"✅ Set all image_url to null")

    elif choice == "3":
        # Try OpenLibrary again
        for book in books:
            isbn = book['isbn']
            book['image_url'] = f"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg"
        print(f"✅ Set all books to use OpenLibrary (try again)")

    elif choice == "4":
        print("✅ Keeping current URLs")
        return

    else:
        print("Invalid choice")
        return

    with open('../src/games/english/book_metadata_y5.json', 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)

    print(f"Updated: ../src/games/english/book_metadata_y5.json")

if __name__ == "__main__":
    main()
