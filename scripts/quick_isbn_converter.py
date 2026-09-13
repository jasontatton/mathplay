"""
Quick ISBN to JSON converter - no API calls, just direct ISBN-based cover links.
This is the fastest approach since you already have all ISBNs.
"""
import json
import argparse


def create_metadata_from_isbns(input_file, output_file, year_label="Year 5"):
    """Convert ISBN list to metadata JSON"""

    books = []
    skipped = []

    with open(input_file, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line or line.startswith('#'):
                continue

            parts = [p.strip() for p in line.split(',')]
            if len(parts) >= 3:
                author, title, isbn = parts[0], parts[1], parts[2]
                # Clean ISBN
                isbn = isbn.replace('-', '').replace(' ', '')

                books.append({
                    "title": title,
                    "author": author,
                    "isbn": isbn,
                    "image_url": f"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg",
                    "synopsis": f"A {year_label} reading list recommendation by {author}. This beloved book is widely recommended for young readers.",
                    "link": f"https://www.google.co.uk/books?vid=ISBN{isbn}"
                })
            else:
                skipped.append((line_num, line))
                print(f"⚠️  Line {line_num}: Incomplete data - {line}")

    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)

    return books, skipped


def main():
    parser = argparse.ArgumentParser(description='Quick ISBN to JSON converter')
    parser.add_argument('--year', type=str, default='y5', help='Year level (e.g., y4, y5, y6)')
    args = parser.parse_args()

    year = args.year
    input_file = f"./books_{year}.txt" if year != "y4" else "./books.txt"
    output_file = f"../src/games/english/book_metadata_{year}.json" if year != "y4" else "../src/games/english/book_metadata.json"

    year_label = f"Year {year[1:]}" if year.startswith('y') else year

    print(f"{'='*60}")
    print(f"Quick ISBN Converter - {year.upper()}")
    print(f"{'='*60}")
    print(f"Input:  {input_file}")
    print(f"Output: {output_file}\n")

    books, skipped = create_metadata_from_isbns(input_file, output_file, year_label)

    print(f"\n{'='*60}")
    print(f"✅ SUCCESS!")
    print(f"{'='*60}")
    print(f"Processed: {len(books)} books")
    print(f"Skipped:   {len(skipped)} lines")
    print(f"\nOutput file: {output_file}")
    print(f"\nFeatures:")
    print(f"  ✅ Book covers (OpenLibrary)")
    print(f"  ✅ Google Books links")
    print(f"  ✅ Author & title info")
    print(f"  ✅ Generic synopses")
    print(f"\nNext steps:")
    print(f"  1. npm start")
    print(f"  2. Navigate to /enlgish/{year}readingList")
    print(f"  3. Enjoy your {len(books)} books!")
    print(f"\nNote: Book covers load from OpenLibrary when you view them.")
    print(f"      Some covers may take a moment to appear.")


if __name__ == "__main__":
    main()
