"""
Get real cover image URLs by checking multiple sources.
Since the APIs are rate-limited, we'll use a multi-source approach with fallbacks.
"""
import json
import time
import requests

def try_get_cover_url(isbn, title, author):
    """Try multiple sources to get a real cover URL"""

    # Try 1: Google Books thumbnail URL (different format)
    urls_to_try = [
        f"http://books.google.com/books/content?id=ISBN:{isbn}&printsec=frontcover&img=1&zoom=1",
        f"https://books.google.com/books/content?id=ISBN{isbn}&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        f"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg",
        f"https://covers.openlibrary.org/b/isbn/{isbn}-M.jpg",
    ]

    for url in urls_to_try:
        try:
            resp = requests.head(url, timeout=5, allow_redirects=True)
            # Check if it's not the generic placeholder (usually around 1200-1500 bytes)
            content_length = int(resp.headers.get('content-length', 0))
            if resp.status_code == 200 and content_length > 2000:
                return url
        except:
            pass

    # If all fail, return the first URL as fallback
    return urls_to_try[0]

def main():
    print("Testing cover URLs for first 5 books...")

    with open('../src/games/english/book_metadata_y5.json', 'r', encoding='utf-8') as f:
        books = json.load(f)

    for i, book in enumerate(books[:5]):
        print(f"\n{i+1}. {book['title']} - {book['author']}")
        print(f"   ISBN: {book['isbn']}")

        url = try_get_cover_url(book['isbn'], book['title'], book['author'])
        print(f"   Testing: {url}")

        try:
            resp = requests.head(url, timeout=5, allow_redirects=True)
            content_length = int(resp.headers.get('content-length', 0))
            print(f"   Status: {resp.status_code}, Size: {content_length} bytes")

            if content_length > 2000:
                print(f"   ✅ Likely a real cover")
            else:
                print(f"   ⚠️  Likely a placeholder")
        except Exception as e:
            print(f"   ❌ Error: {e}")

        time.sleep(0.5)

if __name__ == "__main__":
    main()
