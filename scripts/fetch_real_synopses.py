"""
Fetch real book synopses for books that already have ISBNs.
This script is patient - it runs slowly to avoid rate limits.
"""
import json
import time
import argparse
from pathlib import Path

import requests
from tqdm import tqdm


def get_openlibrary_description(isbn):
    """Try OpenLibrary for book description"""
    try:
        # Method 1: Direct ISBN lookup
        url = f"https://openlibrary.org/isbn/{isbn}.json"
        time.sleep(1.0)  # Be very patient
        resp = requests.get(url, timeout=15)

        if resp.status_code == 200:
            data = resp.json()

            # Description can be a string or dict with 'value' key
            description = data.get("description")
            if isinstance(description, dict):
                description = description.get("value", "")

            if description and len(description) > 50:
                return description.strip()

            # Try to get work description
            if "works" in data and len(data["works"]) > 0:
                work_key = data["works"][0]["key"]
                work_url = f"https://openlibrary.org{work_key}.json"
                time.sleep(1.0)
                work_resp = requests.get(work_url, timeout=15)

                if work_resp.status_code == 200:
                    work_data = work_resp.json()
                    work_desc = work_data.get("description")
                    if isinstance(work_desc, dict):
                        work_desc = work_desc.get("value", "")
                    if work_desc and len(work_desc) > 50:
                        return work_desc.strip()

    except Exception as e:
        pass

    return None


def get_google_books_description(isbn):
    """Try Google Books API (carefully)"""
    try:
        url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}"
        time.sleep(1.5)  # Even more patient with Google
        resp = requests.get(url, timeout=15)

        if resp.status_code == 200:
            data = resp.json()
            if "items" in data and len(data["items"]) > 0:
                volume_info = data["items"][0].get("volumeInfo", {})
                description = volume_info.get("description", "")
                if description and len(description) > 50:
                    return description.strip()
        elif resp.status_code == 429:
            print(f"    ⚠️  Google Books rate limited, skipping...")
            return "RATE_LIMITED"

    except Exception as e:
        pass

    return None


def update_synopsis(book_entry):
    """Update a single book entry with real synopsis"""
    isbn = book_entry["isbn"]
    title = book_entry["title"]
    author = book_entry["author"]

    # Skip if already has a real synopsis
    current_synopsis = book_entry.get("synopsis", "")
    if current_synopsis and not current_synopsis.startswith("A Year"):
        return book_entry, "already_has"

    print(f"\n  📖 {title} by {author}")

    # Try OpenLibrary first (more lenient)
    description = get_openlibrary_description(isbn)
    source = "OpenLibrary"

    # Try Google Books if OpenLibrary didn't work
    if not description:
        description = get_google_books_description(isbn)
        source = "Google Books"

        if description == "RATE_LIMITED":
            # Keep generic but mark for retry
            return book_entry, "rate_limited"

    if description:
        # Truncate if too long
        if len(description) > 800:
            description = description[:800] + "..."

        book_entry["synopsis"] = description
        print(f"    ✅ Found ({source}): {len(description)} chars")
        return book_entry, "success"
    else:
        # Keep the generic one but note it failed
        print(f"    ⚠️  No description found")
        return book_entry, "not_found"


def main():
    parser = argparse.ArgumentParser(description='Fetch real synopses for books')
    parser.add_argument('--year', type=str, default='y5', help='Year level (e.g., y5, y6)')
    parser.add_argument('--start', type=int, default=0, help='Start index (for resuming)')
    parser.add_argument('--limit', type=int, default=None, help='Process only N books (for testing)')
    parser.add_argument('--batch-size', type=int, default=10, help='Save progress every N books')
    args = parser.parse_args()

    year = args.year
    metadata_file = f"../src/games/english/book_metadata_{year}.json" if year != "y4" else "../src/games/english/book_metadata.json"
    backup_file = f"../src/games/english/book_metadata_{year}_backup.json" if year != "y4" else "../src/games/english/book_metadata_backup.json"

    print(f"{'='*70}")
    print(f"Fetching Real Synopses - {year.upper()}")
    print(f"{'='*70}")
    print(f"Input/Output: {metadata_file}")
    print(f"Backup: {backup_file}")
    print(f"Starting at: Book #{args.start + 1}")
    if args.limit:
        print(f"Limit: {args.limit} books")
    print(f"\n⏱️  This will be SLOW - we're being patient to avoid rate limits")
    print(f"   Estimated time: ~{len(range(args.start, args.start + (args.limit or 200))) * 2.5 / 60:.0f}-{len(range(args.start, args.start + (args.limit or 200))) * 3 / 60:.0f} minutes")
    print(f"{'='*70}\n")

    # Load current metadata
    with open(metadata_file, 'r', encoding='utf-8') as f:
        books = json.load(f)

    # Create backup
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)
    print(f"✅ Backup created: {backup_file}\n")

    # Process books
    end_idx = args.start + args.limit if args.limit else len(books)
    books_to_process = books[args.start:end_idx]

    stats = {
        "success": 0,
        "not_found": 0,
        "rate_limited": 0,
        "already_has": 0
    }

    for i, book in enumerate(tqdm(books_to_process, desc="Fetching synopses", initial=args.start)):
        actual_idx = args.start + i
        updated_book, status = update_synopsis(book)
        books[actual_idx] = updated_book
        stats[status] = stats.get(status, 0) + 1

        # Save progress periodically
        if (i + 1) % args.batch_size == 0:
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(books, f, ensure_ascii=False, indent=2)
            print(f"\n    💾 Progress saved (book {actual_idx + 1}/{len(books)})\n")

        # If we hit rate limit, stop early
        if status == "rate_limited":
            print(f"\n⚠️  Hit rate limit at book {actual_idx + 1}")
            print(f"Resume later with: python fetch_real_synopses.py --year {year} --start {actual_idx}")
            break

    # Final save
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*70}")
    print(f"Summary")
    print(f"{'='*70}")
    print(f"✅ Success:       {stats['success']} books")
    print(f"⚠️  Not found:     {stats['not_found']} books")
    print(f"⏭️  Already had:   {stats['already_has']} books")
    print(f"🛑 Rate limited:  {stats['rate_limited']} books")
    print(f"\nOutput: {metadata_file}")
    print(f"Backup: {backup_file}")

    if stats.get("rate_limited", 0) > 0:
        print(f"\n💡 To continue, wait a few hours and run:")
        print(f"   python fetch_real_synopses.py --year {year} --start {args.start + i}")


if __name__ == "__main__":
    main()
