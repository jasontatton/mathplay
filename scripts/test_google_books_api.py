"""Test Google Books API to see current response format"""
import json
import requests
import time

def test_isbn_lookup(isbn):
    """Test direct ISBN lookup"""
    print(f"\n{'='*60}")
    print(f"Testing ISBN: {isbn}")
    print(f"{'='*60}")

    url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}"
    print(f"URL: {url}\n")

    try:
        resp = requests.get(url, timeout=10)
        print(f"Status Code: {resp.status_code}")

        if resp.status_code == 200:
            data = resp.json()
            print(f"Total Items: {data.get('totalItems', 0)}")

            if "items" in data and len(data["items"]) > 0:
                item = data["items"][0]
                volume_info = item.get("volumeInfo", {})

                print(f"\nBook Info:")
                print(f"  Title: {volume_info.get('title', 'N/A')}")
                print(f"  Authors: {volume_info.get('authors', [])}")
                print(f"  Publisher: {volume_info.get('publisher', 'N/A')}")
                print(f"  Published Date: {volume_info.get('publishedDate', 'N/A')}")

                # Check for images
                image_links = volume_info.get("imageLinks", {})
                print(f"\nImage Links:")
                print(f"  Thumbnail: {image_links.get('thumbnail', 'N/A')}")
                print(f"  Small: {image_links.get('small', 'N/A')}")

                # Check for description/synopsis
                description = volume_info.get("description", "")
                print(f"\nDescription/Synopsis:")
                if description:
                    print(f"  Length: {len(description)} characters")
                    print(f"  Preview: {description[:200]}...")
                else:
                    print(f"  ⚠️  NO DESCRIPTION FOUND")

                # Check ISBN identifiers
                print(f"\nISBN Identifiers:")
                for identifier in volume_info.get("industryIdentifiers", []):
                    print(f"  {identifier.get('type')}: {identifier.get('identifier')}")

                print(f"\n✅ Full volumeInfo keys: {list(volume_info.keys())}")

                return data
            else:
                print("⚠️  No items found in response")
                return None
        else:
            print(f"❌ Error response: {resp.text[:200]}")
            return None

    except Exception as e:
        print(f"❌ Exception: {e}")
        return None

# Test with a few ISBNs from the list
test_isbns = [
    ("9780099573661", "Blackhearts in Battersea"),
    ("9781405298193", "Amari and the Night Brothers"),
    ("9781035042517", "Millions"),
    ("9780141378244", "Wonder"),
]

print("GOOGLE BOOKS API TEST")
print("=" * 60)

results = []
for isbn, title in test_isbns:
    result = test_isbn_lookup(isbn)
    results.append((isbn, title, result is not None))
    time.sleep(1)  # Be nice to the API

print(f"\n{'='*60}")
print("SUMMARY")
print(f"{'='*60}")
for isbn, title, success in results:
    status = "✅" if success else "❌"
    print(f"{status} {isbn} - {title}")
