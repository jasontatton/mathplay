import json
import urllib.parse

import requests

AFFILIATE_TAG = "jtatton-21"  # Amazon Associates tag


def google_books_search(title, author):
    """Query Google Books API and return a dict or None."""
    query = f"{title} {author}"
    url = f"https://www.googleapis.com/books/v1/volumes?q={urllib.parse.quote(query)}"
    resp = requests.get(url)
    if resp.status_code != 200:
        return None
    data = resp.json()
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


def build_amazon_link(isbn):
    if not isbn:
        return None
    asin = isbn
    # we need the amazon asin which is available programatically via the api (but you can't have access to the API
    return f"https://www.amazon.co.uk/dp/{asin}/ref=nosim?tag={AFFILIATE_TAG}"


def get_book_metadata(title, author):
    # Try Google Books first
    gb = google_books_search(title, author)
    if gb:
        image_url = gb["image_url"]
        isbn = gb["isbn"]
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
                isbn = ol["isbn"]
            if not synopsis:
                synopsis = ol["synopsis"]

    amazon_link = build_amazon_link(isbn)

    return {
        "title": title,
        "author": author,
        "image_url": image_url,
        "synopsis": synopsis,
        "isbn": isbn,
        "amazon_link": amazon_link
    }


if __name__ == "__main__":
    books = []
    with open("./books.txt", 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue  # skip empty lines
            parts = line.split(",", 1)  # only split on first comma
            if len(parts) == 2:
                author = parts[0].strip()
                title = parts[1].strip()
                books.append((author, title))
            else:
                print(f"Skipping malformed line: {line}")

    results = []

    for title, author in books:
        info = get_book_metadata(title, author)
        results.append(info)
        print(f"Got: {info['title']} ({info['isbn']})")

    # Save to JSON
    with open("../src/games/english/book_metadata.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print("Results written to book_metadata.json")


def isbn13_to_isbn10(isbn13: str) -> str:
    """
    Convert ISBN-13 to ISBN-10.
    ISBN-13 must start with '978'.

    Returns ISBN-10 string if convertible, else None.
    """
    isbn13 = isbn13.replace("-", "").strip()
    if not isbn13.startswith("978") or len(isbn13) != 13:
        return None

    core = isbn13[3:12]  # remove '978' prefix and check digit
    # Calculate ISBN-10 check digit
    total = sum((10 - i) * int(num) for i, num in enumerate(core, 0))
    remainder = total % 11
    check_digit = 11 - remainder
    if check_digit == 10:
        check_char = "X"
    elif check_digit == 11:
        check_char = "0"
    else:
        check_char = str(check_digit)

    return core + check_char


# Example:
print(isbn13_to_isbn10("9780008525903"))  # ISBN-10: '0316769487'
