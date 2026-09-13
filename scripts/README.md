# Book List Metadata Extraction Scripts

This directory contains scripts for extracting book metadata from reading lists.

## 📚 Files Structure

- `books.txt` - Year 4 reading list (original, 135 books)
- `books_y5.txt` - Year 5 reading list (212 books with ISBNs) ✅
- `quick_isbn_converter.py` - **RECOMMENDED** Fast ISBN-to-JSON converter (no API calls)
- `extract_booklist_meta_flexible.py` - API-based extractor (rate limited, slow)
- `extract_booklist_meta.py` - Original Year 4 script (legacy)

## ✅ Recommended Method: Quick ISBN Converter

**Use this when you have ISBNs already** (fastest, most reliable):

```bash
cd scripts
python quick_isbn_converter.py --year y5
```

**Features:**
- ✅ No API calls (no rate limiting!)
- ✅ Processes 200+ books instantly
- ✅ Uses OpenLibrary for cover images
- ✅ Creates Google Books links
- ✅ Generic but useful descriptions

**Output:**
- Generates `../src/games/english/book_metadata_y5.json`
- Ready to use immediately in the React app

## 🐌 Alternative: API-Based Extractor

**Use this if you need real synopses** (slow, may hit rate limits):

```bash
cd scripts
python extract_booklist_meta_flexible.py --year y5
```

**Limitations:**
- ⚠️ Google Books API: ~100-300 requests/day limit
- ⚠️ OpenLibrary: Rate limited, unreliable
- ⚠️ Takes 10-15 minutes for 200+ books
- ⚠️ May fail partway through

**Resume if interrupted:**
```bash
python extract_booklist_meta_flexible.py --year y5 --resume
```

## 📋 Adding Books to a Reading List

Edit the appropriate `books_yX.txt` file with format:

```
Author Name, Book Title, ISBN
```

**Examples:**
```
R.J. Palacio, Wonder, 9780141378244
Philip Pullman, Northern Lights, 9781407130231
Michael Morpurgo, War Horse, 9781405226660
```

**Tips:**
- Find ISBNs on Amazon UK, Waterstones, or Google Books
- Use ISBN-13 (13-digit numbers)
- Commas separate fields
- Lines starting with `#` are comments (ignored)

## 🎯 For New Year Levels

### Step 1: Create book list with ISBNs
```bash
# Create new file
nano books_y6.txt

# Add books in format: Author, Title, ISBN
```

### Step 2: Generate metadata JSON
```bash
python quick_isbn_converter.py --year y6
```

### Step 3: Create React component
```bash
# Copy the Y5 component as template
cp ../src/games/english/y5readingList.tsx ../src/games/english/y6readingList.tsx

# Edit to use book_metadata_y6.json
```

### Step 4: Update routes
Edit these files:
- `src/main/Main.tsx` - Add import, route, and button
- `src/navigation/PathToName.tsx` - Add path mapping

## 📖 How It Works

### Quick Converter (Recommended)
```
Input:  books_y5.txt (Author, Title, ISBN)
        ↓
Process: Pure Python (no API calls)
        ↓
Output: book_metadata_y5.json
        {
          "title": "...",
          "author": "...",
          "isbn": "...",
          "image_url": "https://covers.openlibrary.org/b/isbn/{ISBN}-L.jpg",
          "synopsis": "Generic description",
          "link": "https://www.google.co.uk/books?vid=ISBN{ISBN}"
        }
```

### API Extractor (Slow Alternative)
```
Input:  books_y5.txt
        ↓
Query:  Google Books API (rate limited)
        OpenLibrary API (unreliable)
        ↓
Fetch:  Real synopses, covers, metadata
        ↓
Output: book_metadata_y5.json (with detailed descriptions)
```

## 🔧 What the Scripts Generate

Each book entry includes:

| Field | Quick Converter | API Extractor |
|-------|----------------|---------------|
| title | ✅ From input | ✅ From API (verified) |
| author | ✅ From input | ✅ From API (verified) |
| isbn | ✅ From input | ✅ From API (verified) |
| image_url | ✅ OpenLibrary link | ✅ API thumbnail |
| synopsis | ✅ Generic text | ✅ Real description |
| link | ✅ Google Books | ✅ Google Books |

## 📊 Current Status

### Year 4 (Y4)
- ✅ 135 books with detailed metadata
- ✅ Real synopses from Google Books
- ✅ Live in production

### Year 5 (Y5)
- ✅ 212 books with ISBNs
- ✅ Generated with quick converter
- ✅ Generic synopses
- ✅ Live and working

## 🚨 Troubleshooting

### "Quota exceeded" error
**Problem:** Google Books API rate limit hit
**Solution:** Use `quick_isbn_converter.py` instead (no API calls)

### "Connection reset" error
**Problem:** Too many requests to OpenLibrary
**Solution:** Increase delay in script or use quick converter

### Missing book covers
**Problem:** ISBN not in OpenLibrary database
**Solution:** 
1. Try ISBN-10 instead of ISBN-13
2. Find cover URL on Google Books manually
3. Edit JSON file to update `image_url`

### Books missing ISBNs
**Problem:** No ISBN in source file
**Solution:** Look up ISBNs on Amazon/Waterstones and add to .txt file

## 📝 Example: Complete Workflow

```bash
# 1. Start with book list (with ISBNs)
cat books_y5.txt
# Joan Aiken, Blackhearts in Battersea, 9780099573661
# ...

# 2. Convert to JSON (instant!)
python quick_isbn_converter.py --year y5

# 3. Verify output
cat ../src/games/english/book_metadata_y5.json | jq 'length'
# 212

# 4. Test in browser
cd ..
npm start
# Navigate to /enlgish/y5readingList
```

## 🎯 Success Criteria

A working reading list has:
- ✅ All books with ISBNs
- ✅ Valid JSON structure
- ✅ Cover image URLs
- ✅ Google Books links
- ✅ Author and title info
- ✅ React component created
- ✅ Routes configured

## 📚 Dependencies

### For Quick Converter
```bash
# None! Pure Python stdlib
```

### For API Extractor
```bash
pip install requests tqdm
```

## 🔗 Resources

- **OpenLibrary Covers:** https://openlibrary.org/dev/docs/api/covers
- **Google Books API:** https://developers.google.com/books/docs/v1/using
- **ISBN Lookup:** https://www.amazon.co.uk/ or https://www.waterstones.com/

---

## Quick Reference

| Task | Command |
|------|---------|
| Convert Y5 with ISBNs | `python quick_isbn_converter.py --year y5` |
| Extract Y5 with APIs | `python extract_booklist_meta_flexible.py --year y5` |
| Resume after failure | `python extract_booklist_meta_flexible.py --year y5 --resume` |
| Check book count | `cat ../src/games/english/book_metadata_y5.json \| jq 'length'` |
| View first book | `cat ../src/games/english/book_metadata_y5.json \| jq '.[0]'` |

**For Year 5: Use `quick_isbn_converter.py` - it's instant and works perfectly!** ✅
