# Book List Metadata Extraction Scripts

This directory contains scripts for extracting book metadata from reading lists.

## Files Structure

- `books.txt` - Year 4 reading list (original)
- `books_y5.txt` - Year 5 reading list
- `extract_booklist_meta.py` - Original script for Year 4 (legacy)
- `extract_booklist_meta_y5.py` - Year 5 specific script
- `extract_booklist_meta_flexible.py` - **Recommended** flexible script for all years

## Usage

### Adding Books to a Reading List

Edit the appropriate `books_yX.txt` file and add books in the format:

```
Author Name, Book Title
Author Name, Book Title, ISBN
```

Lines starting with `#` are treated as comments and ignored.

### Extracting Metadata

#### Using the Flexible Script (Recommended)

For Year 4:
```bash
cd scripts
python extract_booklist_meta_flexible.py --year y4
```

For Year 5:
```bash
cd scripts
python extract_booklist_meta_flexible.py --year y5
```

For future years (e.g., Year 6):
```bash
cd scripts
python extract_booklist_meta_flexible.py --year y6
```

#### Using Year-Specific Scripts

For Year 4:
```bash
cd scripts
python extract_booklist_meta.py
```

For Year 5:
```bash
cd scripts
python extract_booklist_meta_y5.py
```

## What the Script Does

1. Reads the book list from `books_yX.txt`
2. Queries Google Books API for metadata (cover image, synopsis, ISBN)
3. Falls back to Open Library if Google Books doesn't have the data
4. Generates `../src/games/english/book_metadata_yX.json` with all metadata
5. Updates the `books_yX.txt` file with ISBN numbers for future reference

## Output

The script generates JSON in the format:
```json
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "image_url": "https://...",
    "synopsis": "Book description...",
    "isbn": "9781234567890",
    "link": "https://www.google.co.uk/books?vid=ISBN..."
  }
]
```

## Adding a New Year Level

1. Create `scripts/books_yX.txt` with the new reading list
2. Run `python extract_booklist_meta_flexible.py --year yX`
3. Create `src/games/english/yXreadingList.tsx`:
   ```tsx
   import React from "react";
   import bookData from "./book_metadata_yX.json";
   import Booklist from "./Booklist";

   const YXReadingList: React.FC = () => {
       return (
           <div style={{padding: 20}}>
               <Booklist books={bookData}/>
           </div>
       );
   };

   export default YXReadingList;
   ```
4. Update `src/main/Main.tsx` to import and route the new component
5. Update `src/navigation/PathToName.tsx` to add the new path

## Dependencies

- `requests` - HTTP library for API calls
- `tqdm` - Progress bar display

Install with:
```bash
pip install requests tqdm
```
