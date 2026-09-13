"""
Fetch book descriptions from Google Books website (not API).
This bypasses API rate limits by scraping the actual book pages.
"""
import json
import time
import re
import argparse

import requests
from bs4 import BeautifulSoup
from tqdm import tqdm


def get_google_books_description(isbn):
    """Scrape description from Google Books webpage"""
    try:
        # Direct link to book page
        url = f"https://www.google.com/books/edition/_/{isbn}"

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        time.sleep(1.0)  # Be polite
        resp = requests.get(url, headers=headers, timeout=15)

        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'html.parser')

            # Try to find description in meta tags
            meta_desc = soup.find('meta', {'name': 'description'})
            if meta_desc and meta_desc.get('content'):
                desc = meta_desc['content'].strip()
                if len(desc) > 50:
                    return desc, 'meta'

            # Try to find in page content
            # Google Books often has description in specific divs
            desc_divs = soup.find_all('div', {'class': re.compile(r'description|synopsis|about', re.I)})
            for div in desc_divs:
                text = div.get_text().strip()
                if len(text) > 50:
                    return text[:800], 'page_div'

    except Exception as e:
        pass

    return None, None


def get_description_from_search(isbn):
    """Get description from Google Books search result"""
    try:
        # Use Google Books search
        url = f"https://books.google.com/books?isbn={isbn}"

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

        time.sleep(1.0)
        resp = requests.get(url, headers=headers, timeout=15, allow_redirects=True)

        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'html.parser')

            # Look for description
            desc_elem = soup.find('div', {'id': 'synopsistext'})
            if desc_elem:
                return desc_elem.get_text().strip(), 'synopsis_div'

            # Try other common locations
            for div_id in ['description', 'about_book']:
                elem = soup.find('div', {'id': div_id})
                if elem:
                    text = elem.get_text().strip()
                    if len(text) > 50:
                        return text, div_id

    except Exception as e:
        pass

    return None, None


def update_book_with_web_scraping(book):
    """Update book entry with scraped description"""
    isbn = book['isbn']
    title = book['title']

    # Skip if already has real synopsis
    current = book.get('synopsis', '')
    if current and not current.startswith('A Year'):
        return book, 'has_real'

    # Try method 1: Direct book page
    desc, source = get_google_books_description(isbn)

    # Try method 2: Search page
    if not desc:
        desc, source = get_description_from_search(isbn)

    if desc:
        # Clean up
        desc = desc.strip()
        if len(desc) > 800:
            desc = desc[:800] + '...'

        book['synopsis'] = desc
        return book, f'success_{source}'

    return book, 'not_found'


def main():
    parser = argparse.ArgumentParser(description='Fetch synopses from Google Books website')
    parser.add_argument('--year', type=str, default='y5', help='Year level')
    parser.add_argument('--start', type=int, default=0, help='Start index')
    parser.add_argument('--limit', type=int, default=None, help='Process N books')
    args = parser.parse_args()

    year = args.year
    metadata_file = f"../src/games/english/book_metadata_{year}.json" if year != "y4" else "../src/games/english/book_metadata.json"
    backup_file = f"../src/games/english/book_metadata_{year}_backup.json"

    print(f"Fetching synopses from Google Books website (not API)")
    print(f"File: {metadata_file}\n")

    # Load
    with open(metadata_file, 'r', encoding='utf-8') as f:
        books = json.load(f)

    # Backup
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)

    # Process
    end_idx = args.start + args.limit if args.limit else len(books)

    stats = {}
    for i, book in enumerate(tqdm(books[args.start:end_idx], desc="Scraping")):
        actual_idx = args.start + i

        updated, status = update_book_with_web_scraping(book)
        books[actual_idx] = updated
        stats[status] = stats.get(status, 0) + 1

        if status.startswith('success'):
            print(f"\n✅ {book['title']}: {updated['synopsis'][:80]}...")

        # Save every 10
        if (i + 1) % 10 == 0:
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(books, f, ensure_ascii=False, indent=2)

    # Final save
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print("Results:")
    for status, count in sorted(stats.items()):
        print(f"  {status}: {count}")


if __name__ == "__main__":
    main()
