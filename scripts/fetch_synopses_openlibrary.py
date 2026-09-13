"""
Fetch real book synopses using ONLY OpenLibrary (no Google Books).
OpenLibrary is more lenient with rate limits.
"""
import json
import time
import argparse

import requests
from tqdm import tqdm


def get_book_description(isbn, title, author):
    """Get description from OpenLibrary using multiple strategies"""

    # Strategy 1: Direct ISBN lookup
    try:
        url = f"https://openlibrary.org/isbn/{isbn}.json"
        time.sleep(0.8)  # Reasonable delay
        resp = requests.get(url, timeout=15)

        if resp.status_code == 200:
            data = resp.json()

            # Check for description
            description = data.get("description")
            if isinstance(description, dict):
                description = description.get("value", "")

            if description and len(description) > 50:
                return description.strip(), "direct_isbn"

            # Try to get work description
            if "works" in data and len(data["works"]) > 0:
                work_key = data["works"][0]["key"]
                work_url = f"https://openlibrary.org{work_key}.json"
                time.sleep(0.8)
                work_resp = requests.get(work_url, timeout=15)

                if work_resp.status_code == 200:
                    work_data = work_resp.json()
                    work_desc = work_data.get("description")
                    if isinstance(work_desc, dict):
                        work_desc = work_desc.get("value", "")
                    if work_desc and len(work_desc) > 50:
                        return work_desc.strip(), "work"

            # Try excerpts
            excerpts = data.get("excerpts", [])
            if excerpts and len(excerpts) > 0:
                excerpt_text = excerpts[0].get("excerpt", "")
                if len(excerpt_text) > 50:
                    return excerpt_text.strip(), "excerpt"

    except Exception as e:
        print(f"      Error in ISBN lookup: {e}")

    # Strategy 2: Search by title and author
    try:
        query = f"{title} {author}".replace(" ", "+")
        url = f"https://openlibrary.org/search.json?q={query}&limit=1"
        time.sleep(0.8)
        resp = requests.get(url, timeout=15)

        if resp.status_code == 200:
            data = resp.json()
            if "docs" in data and len(data["docs"]) > 0:
                doc = data["docs"][0]

                # Check first_sentence
                first_sentence = doc.get("first_sentence", [])
                if isinstance(first_sentence, list) and len(first_sentence) > 0:
                    sentence = first_sentence[0]
                    if len(sentence) > 50:
                        return sentence.strip(), "search_sentence"

    except Exception as e:
        print(f"      Error in search: {e}")

    return None, None


def update_book_synopsis(book_entry):
    """Update a single book with real synopsis"""
    isbn = book_entry["isbn"]
    title = book_entry["title"]
    author = book_entry["author"]

    # Skip if already has a real synopsis
    current_synopsis = book_entry.get("synopsis", "")
    if current_synopsis and not current_synopsis.startswith("A Year"):
        return book_entry, "already_has_real"

    description, source = get_book_description(isbn, title, author)

    if description:
        # Clean up and truncate if needed
        description = description.strip()
        if len(description) > 800:
            description = description[:800] + "..."

        book_entry["synopsis"] = description
        return book_entry, f"success_{source}"
    else:
        # Keep generic synopsis
        return book_entry, "not_found"


def main():
    parser = argparse.ArgumentParser(description='Fetch real synopses using OpenLibrary')
    parser.add_argument('--year', type=str, default='y5', help='Year level (e.g., y5, y6)')
    parser.add_argument('--start', type=int, default=0, help='Start index (for resuming)')
    parser.add_argument('--limit', type=int, default=None, help='Process only N books')
    parser.add_argument('--batch-save', type=int, default=10, help='Save every N books')
    args = parser.parse_args()

    year = args.year
    metadata_file = f"../src/games/english/book_metadata_{year}.json" if year != "y4" else "../src/games/english/book_metadata.json"
    backup_file = f"../src/games/english/book_metadata_{year}_backup.json" if year != "y4" else "../src/games/english/book_metadata_backup.json"

    print(f"{'='*70}")
    print(f"Fetch Real Synopses - {year.upper()} (OpenLibrary Only)")
    print(f"{'='*70}")
    print(f"File: {metadata_file}")
    print(f"Start: Book #{args.start + 1}")
    if args.limit:
        print(f"Limit: {args.limit} books")
    print(f"\n⏱️  Estimated time: ~{(args.limit or 200) * 1.8 / 60:.1f} minutes")
    print(f"{'='*70}\n")

    # Load metadata
    with open(metadata_file, 'r', encoding='utf-8') as f:
        books = json.load(f)

    # Backup
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)
    print(f"✅ Backup created: {backup_file}\n")

    # Process books
    end_idx = args.start + args.limit if args.limit else len(books)
    books_to_process = books[args.start:end_idx]

    stats = {}
    successful_updates = 0

    try:
        for i, book in enumerate(tqdm(books_to_process, desc="Fetching synopses", colour="cyan")):
            actual_idx = args.start + i

            # Update book
            updated_book, status = update_book_synopsis(book)
            books[actual_idx] = updated_book

            # Track stats
            stats[status] = stats.get(status, 0) + 1
            if status.startswith("success"):
                successful_updates += 1
                print(f"\n  ✅ {book['title'][:50]}")
                print(f"     {updated_book['synopsis'][:100]}...")

            # Save periodically
            if (i + 1) % args.batch_save == 0:
                with open(metadata_file, 'w', encoding='utf-8') as f:
                    json.dump(books, f, ensure_ascii=False, indent=2)
                print(f"\n  💾 Saved progress: {actual_idx + 1}/{len(books)} books\n")

    except KeyboardInterrupt:
        print(f"\n\n⚠️  Interrupted! Saving progress...")
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(books, f, ensure_ascii=False, indent=2)
        print(f"Progress saved. Resume with: --start {actual_idx}")
        return

    # Final save
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*70}")
    print(f"Results")
    print(f"{'='*70}")
    for status, count in sorted(stats.items()):
        emoji = "✅" if "success" in status else "⚠️" if "not_found" in status else "⏭️"
        print(f"{emoji} {status:20s}: {count:3d} books")

    print(f"\n📊 Success rate: {successful_updates}/{len(books_to_process)} ({100*successful_updates/len(books_to_process):.1f}%)")
    print(f"\nOutput: {metadata_file}")

    if stats.get("not_found", 0) > 0:
        print(f"\n💡 {stats['not_found']} books kept generic synopses (no description in OpenLibrary)")


if __name__ == "__main__":
    main()
