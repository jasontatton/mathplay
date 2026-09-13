"""
Simple helper to update synopsis for specific books.
Usage: python update_book_synopsis.py --title "Book Title" --synopsis "Real description here"
"""
import json
import argparse


def update_synopsis(metadata_file, title, new_synopsis):
    """Update synopsis for a specific book"""

    with open(metadata_file, 'r', encoding='utf-8') as f:
        books = json.load(f)

    found = False
    for book in books:
        if book['title'].lower() == title.lower():
            old_synopsis = book['synopsis']
            book['synopsis'] = new_synopsis
            found = True
            print(f"✅ Updated: {book['title']}")
            print(f"\nOld: {old_synopsis[:100]}...")
            print(f"\nNew: {new_synopsis[:100]}...")
            break

    if not found:
        print(f"❌ Book not found: {title}")
        print(f"\nAvailable titles containing '{title}':")
        matches = [b['title'] for b in books if title.lower() in b['title'].lower()]
        for match in matches[:10]:
            print(f"  - {match}")
        return False

    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Saved to {metadata_file}")
    return True


def main():
    parser = argparse.ArgumentParser(description='Update synopsis for a specific book')
    parser.add_argument('--year', type=str, default='y5', help='Year level (e.g., y5, y6)')
    parser.add_argument('--title', type=str, required=True, help='Book title to update')
    parser.add_argument('--synopsis', type=str, required=True, help='New synopsis text')
    args = parser.parse_args()

    metadata_file = f"../src/games/english/book_metadata_{args.year}.json" if args.year != "y4" else "../src/games/english/book_metadata.json"

    update_synopsis(metadata_file, args.title, args.synopsis)


if __name__ == "__main__":
    main()
