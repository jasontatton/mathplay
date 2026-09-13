"""
Merge synopses from Year5_Reading_List_2024_Summaries.json into book_metadata_y5.json
Matches on author and title.
"""
import json


def normalize_string(s):
    """Normalize string for matching (lowercase, remove extra spaces, normalize quotes)"""
    # Replace all fancy apostrophes and quotes with standard ones
    s = s.replace(''', "'").replace(''', "'").replace('"', '"').replace('"', '"')
    s = s.replace('’', "'").replace('‘', "'")  # Unicode right/left single quotes
    s = s.replace('“', '"').replace('”', '"')  # Unicode left/right double quotes
    # Also normalize other common punctuation
    s = s.replace('—', '-').replace('–', '-')  # Em dash, en dash
    return ' '.join(s.lower().strip().split())


def find_match(book, summaries):
    """Find matching summary for a book"""
    book_title = normalize_string(book['title'])
    book_author = normalize_string(book['author'])

    for summary in summaries:
        summary_title = normalize_string(summary['title'])
        summary_author = normalize_string(summary['author'])

        # Exact match
        if book_title == summary_title and book_author == summary_author:
            return summary['synopsis']

        # Title match with partial author match (handles name variations)
        if book_title == summary_title:
            # Check if authors are similar (e.g., "B.B. Alston" vs "BB Alston")
            if summary_author in book_author or book_author in summary_author:
                return summary['synopsis']

    return None


def main():
    # Load files
    print("Loading files...")
    with open('./Year5_Reading_List_2024_Summaries.json', 'r', encoding='utf-8') as f:
        summaries = json.load(f)

    with open('../src/games/english/book_metadata_y5.json', 'r', encoding='utf-8') as f:
        books = json.load(f)

    print(f"Found {len(summaries)} summaries")
    print(f"Found {len(books)} books\n")

    # Create backup
    with open('../src/games/english/book_metadata_y5_backup.json', 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)
    print("✅ Backup created: book_metadata_y5_backup.json\n")

    # Match and update
    matched = 0
    not_matched = []

    for book in books:
        synopsis = find_match(book, summaries)
        if synopsis:
            book['synopsis'] = synopsis
            matched += 1
            print(f"✅ {book['author']}: {book['title']}")
        else:
            not_matched.append((book['author'], book['title']))
            print(f"⚠️  No match: {book['author']}: {book['title']}")

    # Save updated metadata
    with open('../src/games/english/book_metadata_y5.json', 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*70}")
    print(f"Results:")
    print(f"{'='*70}")
    print(f"✅ Matched:     {matched}/{len(books)} books ({100*matched/len(books):.1f}%)")
    print(f"⚠️  Not matched: {len(not_matched)} books")

    if not_matched:
        print(f"\nBooks without summaries:")
        for author, title in not_matched[:20]:
            print(f"  - {author}: {title}")
        if len(not_matched) > 20:
            print(f"  ... and {len(not_matched) - 20} more")

    print(f"\n✅ Updated: ../src/games/english/book_metadata_y5.json")


if __name__ == "__main__":
    main()
