import json
import urllib.parse

import requests
from tqdm import tqdm

AFFILIATE_TAG = "jtatton-21"  # Amazon Associates tag


# Used to generate book_metadata.json from the booklist

def google_books_search(title: str, author: str, isbn: str):
    """Query Google Books API and return a dict or None."""

    urls = []

    if isbn:
        urls = [f"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}", ]

    urls += [f"https://www.googleapis.com/books/v1/volumes?q={urllib.parse.quote(f'{title} {author}')}", ]

    for url in urls:
        resp = requests.get(url)
        if resp.status_code != 200:
            continue
        data = resp.json()
        if "items" not in data or len(data["items"]) == 0:
            continue

    if resp.status_code != 200:
        return None
    if "items" not in data or len(data["items"]) == 0:
        return None

    # Try to pick the best match (exact title/author match)
    best_item = None
    for item in data["items"]:
        info = item.get("volumeInfo", {})
        book_title = info.get("title", "").lower()
        authors = [a.lower() for a in info.get("authors", [])]
        if title.lower() == book_title.lower() and author.lower() in " ".join(authors):
            best_item = item
            break
    if not best_item:
        best_item = data["items"][0]  # fallback to first

    info = best_item.get("volumeInfo", {})
    image_url = info.get("imageLinks", {}).get("thumbnail", None)
    synopsis = info.get("description", "")

    # Prefer ISBN-13 if available
    isbn = None
    isbn10 = None
    for id_obj in info.get("industryIdentifiers", []):
        if id_obj["type"] == "ISBN_13" and not isbn:
            isbn = id_obj["identifier"]
        elif id_obj["type"] == "ISBN_10":
            isbn10 = id_obj["identifier"]
    if not isbn and isbn10:
        isbn = isbn10  # fallback

    return {
        "title": info.get("title", title),
        "authors": info.get("authors", [author]),
        "image_url": image_url,
        "synopsis": synopsis,
        "isbn": isbn
    }


def openlibrary_lookup(title, author):
    """Fallback search in Open Library."""
    query = f"{title} {author}"
    url = f"https://openlibrary.org/search.json?q={urllib.parse.quote(query)}"
    resp = requests.get(url)
    if resp.status_code != 200:
        return None
    data = resp.json()
    if "docs" not in data or len(data["docs"]) == 0:
        return None

    doc = data["docs"][0]
    isbn = None
    if "isbn" in doc and len(doc["isbn"]) > 0:
        # Prefer ISBN-13 if available
        isbn13s = [i for i in doc["isbn"] if len(i) == 13]
        isbn = isbn13s[0] if isbn13s else doc["isbn"][0]
    image_url = None
    if isbn:
        image_url = f"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg"

    synopsis = doc.get("first_sentence", [""])[0] if isinstance(doc.get("first_sentence", ""), list) else doc.get(
        "first_sentence", "")

    return {
        "title": doc.get("title", title),
        "authors": doc.get("author_name", [author]),
        "image_url": image_url,
        "synopsis": synopsis,
        "isbn": isbn
    }


def build_link(isbn):
    return f'https://www.google.co.uk/books?vid=ISBN{isbn}'


def get_book_metadata(title, author, isbn):
    # Try Google Books first
    gb = google_books_search(title, author, isbn)
    if gb:
        image_url = gb["image_url"]
        isbn = gb["isbn"] or isbn
        synopsis = gb["synopsis"]
    else:
        image_url = isbn = synopsis = None

    # Fallback to Open Library if needed
    if not image_url or not isbn:
        ol = openlibrary_lookup(title, author)
        if ol:
            if not image_url:
                image_url = ol["image_url"]
            if not isbn:
                isbn = ol["isbn"] or isbn
            if not synopsis:
                synopsis = ol["synopsis"]

    link = build_link(isbn)

    return {
        "title": title,
        "author": author,
        "image_url": image_url,
        "synopsis": synopsis,
        "isbn": isbn,
        "link": link,
    }


def main():
    # if no isbn in books.txt get most likely isbn from google api
    # when most likely found then suppliment books.txt - if can't find one or the wrong one is picked then we need to
    # # get it manually

    books = []
    with open("./books.txt", 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue  # skip empty lines
            parts = line.split(",")
            if len(parts) == 2:
                author = parts[0].strip()
                title = parts[1].strip()
                books.append((author, title, None))
            elif len(parts) == 3:
                author = parts[0].strip()
                title = parts[1].strip()
                isbn = parts[2].strip()
                books.append((author, title, isbn))
            else:
                print(f"Skipping malformed line: {line}")

    results = []

    for (author, title, isbn) in tqdm(books, desc="Extract metadata", colour="green", leave=False):
        info = get_book_metadata(title, author, isbn)
        if info['isbn'] is not None:
            results.append(info)
        else:
            print(f"Failed on: {info['author']} - {info['title']} ")

    # Save to JSON
    with open("../src/games/english/book_metadata.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    with open("./books.txt", 'w') as f:
        f.writelines([f"{info['author']}, {info['title']}, {info['isbn']}\n" for info in results])

    print("Results written to book_metadata.json, books_new.txt")

    # isbns for batch conversion to


if __name__ == "__main__":
    main()
