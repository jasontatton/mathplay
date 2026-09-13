"""
Simple script to download book covers locally.
"""
import json
import time
import os
import requests
from tqdm import tqdm

def download_cover(isbn, output_dir):
    """Download cover from OpenLibrary"""
    output_path = os.path.join(output_dir, f"{isbn}.jpg")

    # Skip if already exists and is a real image
    if os.path.exists(output_path) and os.path.getsize(output_path) > 2000:
        return True, "exists"

    # Try OpenLibrary
    url = f"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg"

    try:
        time.sleep(0.5)  # Be polite
        resp = requests.get(url, timeout=15)

        if resp.status_code == 200 and len(resp.content) > 2000:
            with open(output_path, 'wb') as f:
                f.write(resp.content)
            return True, "downloaded"

    except Exception as e:
        pass

    return False, "failed"


def main():
    print("Downloading book covers from OpenLibrary...\n")

    # Load metadata
    with open('../src/games/english/book_metadata_y5.json', 'r', encoding='utf-8') as f:
        books = json.load(f)

    output_dir = '../public/book-covers'
    os.makedirs(output_dir, exist_ok=True)

    print(f"Processing {len(books)} books...")
    print(f"Output: {output_dir}\n")

    downloaded = 0
    exists = 0
    failed = 0
    failed_list = []

    for book in tqdm(books, desc="Downloading"):
        isbn = book['isbn']
        success, status = download_cover(isbn, output_dir)

        if success:
            if status == "downloaded":
                downloaded += 1
            else:
                exists += 1
        else:
            failed += 1
            failed_list.append((book['author'], book['title'], isbn))

    print(f"\n{'='*60}")
    print(f"✅ Downloaded: {downloaded}")
    print(f"⏭️  Already had: {exists}")
    print(f"❌ Failed: {failed}")
    print(f"\nTotal available: {downloaded + exists}/{len(books)}")

    if failed_list:
        print(f"\nFailed books (first 10):")
        for author, title, isbn in failed_list[:10]:
            print(f"  - {author}: {title}")

    # Now update metadata to use local paths
    print(f"\nUpdating metadata...")
    for book in books:
        isbn = book['isbn']
        local_path = os.path.join(output_dir, f"{isbn}.jpg")

        if os.path.exists(local_path):
            book['image_url'] = f"/mathplay/book-covers/{isbn}.jpg"
        else:
            # Use a placeholder
            book['image_url'] = None

    with open('../src/games/english/book_metadata_y5.json', 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)

    print(f"✅ Metadata updated!")


if __name__ == "__main__":
    main()
