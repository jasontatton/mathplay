# Year 5 Reading List Setup Summary

## Overview
Successfully set up the Year 5 reading list infrastructure by cloning and refactoring the Year 4 reading list code. The system is now extensible for future year levels (Y6, Y7, etc.).

## Files Created

### Scripts Directory (`scripts/`)
1. **`books_y5.txt`** - Empty stub file for Year 5 book list
   - Format: `Author, Title, ISBN (optional)`
   - Comments supported with `#`

2. **`extract_booklist_meta_y5.py`** - Year 5 specific metadata extraction script
   - Queries Google Books API and OpenLibrary
   - Generates `book_metadata_y5.json`

3. **`extract_booklist_meta_flexible.py`** - **RECOMMENDED** unified script for all years
   - Accepts `--year` parameter (e.g., `--year y4`, `--year y5`)
   - Single script to maintain for all future year levels

4. **`README.md`** - Complete documentation for the scripts system

### Source Code (`src/games/english/`)
1. **`book_metadata_y5.json`** - Empty JSON array ready for Y5 book metadata

2. **`y5readingList.tsx`** - React component for Year 5 reading list
   - Imports `book_metadata_y5.json`
   - Uses shared `Booklist` component
   - Identical pattern to `y4readingList.tsx`

### Navigation Updates
1. **`src/main/Main.tsx`**
   - Added import for `Y5ReadingList`
   - Added button to home page English section
   - Added route `/enlgish/y5readingList`

2. **`src/navigation/PathToName.tsx`**
   - Added path `/enlgish/y5readingList`
   - Added display name "Y5 Reading List"

## How to Populate Year 5 Books

### Step 1: Add Books to `scripts/books_y5.txt`

```
# Year 5 Reading List
Author Name, Book Title
Author Name, Book Title, ISBN
...
```

### Step 2: Run the Extraction Script

**Option A: Using the flexible script (recommended)**
```bash
cd scripts
python extract_booklist_meta_flexible.py --year y5
```

**Option B: Using the Y5-specific script**
```bash
cd scripts
python extract_booklist_meta_y5.py
```

### Step 3: Verify Output
The script will:
- Query book metadata from Google Books API
- Fall back to OpenLibrary if needed
- Generate `src/games/english/book_metadata_y5.json`
- Update `scripts/books_y5.txt` with found ISBNs

### Step 4: Test
```bash
npm start
```
Navigate to the home page and click the second "Books" button to see the Y5 reading list.

## Architecture Benefits

### Reusability
- **Shared `Booklist` component** - Single UI component used by all year levels
- **Consistent data format** - All year levels use the same JSON structure
- **Single extraction script** - `extract_booklist_meta_flexible.py` handles all years

### Extensibility
To add Year 6 (or any future year):
1. Create `scripts/books_y6.txt`
2. Run `python extract_booklist_meta_flexible.py --year y6`
3. Create `src/games/english/y6readingList.tsx` (copy y5 pattern)
4. Update `Main.tsx` and `PathToName.tsx`

## File Structure
```
mathplay/
├── scripts/
│   ├── books.txt                              # Y4 books (original)
│   ├── books_y5.txt                           # Y5 books (new)
│   ├── extract_booklist_meta.py               # Y4 script (original)
│   ├── extract_booklist_meta_y5.py            # Y5 script (new)
│   ├── extract_booklist_meta_flexible.py      # Unified script (recommended)
│   └── README.md                              # Script documentation
│
└── src/
    ├── games/
    │   └── english/
    │       ├── Booklist.tsx                   # Shared UI component
    │       ├── book_metadata.json             # Y4 data
    │       ├── book_metadata_y5.json          # Y5 data (new)
    │       ├── y4readingList.tsx              # Y4 component
    │       └── y5readingList.tsx              # Y5 component (new)
    │
    ├── main/
    │   └── Main.tsx                           # Updated with Y5 route
    │
    └── navigation/
        └── PathToName.tsx                     # Updated with Y5 path
```

## Next Steps

1. **Populate Y5 book list**: Add books to `scripts/books_y5.txt`
2. **Run metadata extraction**: `python extract_booklist_meta_flexible.py --year y5`
3. **Test the UI**: Verify books display correctly
4. **Optional**: Consider updating button images to differentiate Y4 vs Y5

## Notes

- The typo `/enlgish/` (instead of `/english/`) is preserved from the Y4 implementation for consistency
- Both Y4 and Y5 routes use the same `booksImg` icon currently
- The `Booklist` component includes horizontal scrolling, snap-to-center, and random initial position
- All book links point to Google Books with ISBN lookup
