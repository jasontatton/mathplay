"""Fix the 5 remaining books manually"""
import json

fixes = {
    "A Rag a Bone and a Hank of Hair": "Children from a future world visit the past to learn what real people were like, a clever, thought-provoking science-fiction tale.",
    "I Coriander": "A girl with a fairy heritage must fight dark magic in 17th-century London, a richly imagined fantasy adventure.",
    "Blood Red Snow White": "A spy in revolutionary Russia risks everything, a gripping historical thriller based on real events.",
    "Arsenic for Tea series": "Two young sleuths solve murders in 1930s England, perfect for fans of vintage mysteries.",
    "Chinese Cinderella: The Mystery of the Song Dynasty Painting": "A girl detective in ancient China solves a mystery tied to a precious painting, combining history and adventure."
}

with open('../src/games/english/book_metadata_y5.json', 'r', encoding='utf-8') as f:
    books = json.load(f)

for book in books:
    if book['title'] in fixes:
        book['synopsis'] = fixes[book['title']]
        print(f"✅ Fixed: {book['title']}")

with open('../src/games/english/book_metadata_y5.json', 'w', encoding='utf-8') as f:
    json.dump(books, f, ensure_ascii=False, indent=2)

print("\n✅ All 5 books updated!")
