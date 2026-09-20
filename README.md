# Simple URL Shortener

A backend URL shortener built with Express.js and SQLite. Accepts a long URL, generates a unique short code, stores the mapping, and redirects short codes back to their original URLs.

Built as **Task 1** for the CodeAlpha backend development internship.

## Tech stack

- **Node.js** with **Express.js** — HTTP server and routing
- **SQLite** (via `better-sqlite3`) — persistent storage for URL mappings
- **nanoid** — random short code generation
- **ESM** (`import`/`export`) module syntax throughout

## Project structure

```
url-shortener/
├── package.json
├── .gitignore
├── database.db          (created automatically at runtime, gitignored)
├── src/
│   ├── server.js         Entry point — Express app setup and route mounting
│   ├── db/
│   │   └── db.js         SQLite connection + table creation
│   ├── routes/
│   │   ├── shorten.js    POST /api/shorten route definition
│   │   └── redirect.js   GET /:shortCode route definition
│   ├── controllers/
│   │   ├── shortenController.js   Logic for creating/deduplicating short URLs
│   │   └── redirectController.js  Logic for looking up and redirecting
│   └── utils/
│       └── generateCode.js        Random short code generation with collision handling
```

**Why this structure:** routes stay thin (they only map an HTTP method + path to a controller function), controllers hold the actual logic, and `utils/` holds pure logic with no HTTP awareness — making it independently reusable and easy to reason about.

## Getting started

### 1. Install dependencies

```bash
npm install
```

This installs the three packages listed in `package.json`:

| Package          | Purpose                                                 |
| ---------------- | ------------------------------------------------------- |
| `express`        | Web framework — HTTP server, routing, JSON body parsing |
| `better-sqlite3` | Synchronous SQLite driver — reads/writes `database.db`  |
| `nanoid`         | Generates random, URL-safe short codes                  |

### 2. Start the server

```bash
npm start
```

You should see:

```
URL shortener running at http://localhost:3000
```

The SQLite database file (`database.db`) and its `urls` table are created automatically on first run — no manual setup required.

## API contract

### `POST /api/shorten`

Shortens a long URL. If the exact URL has already been shortened before, returns the existing short code instead of creating a new one.

**Request body:**

```json
{
  "url": "https://example.com/some/very/long/path"
}
```

**Response — new URL (`201 Created`):**

```json
{
  "shortCode": "aZ3kT9x",
  "shortUrl": "http://localhost:3000/aZ3kT9x",
  "originalUrl": "https://example.com/some/very/long/path"
}
```

**Response — duplicate URL (`200 OK`):**
Same body shape as above — the status code is what distinguishes "already existed" from "newly created."

**Response — invalid input (`400 Bad Request`):**

```json
{
  "error": "A valid 'url' field is required"
}
```

### `GET /:shortCode`

Redirects to the original URL associated with the given short code.

**Response — found:** `302 Found` with a `Location` header pointing to the original URL.

**Response — not found (`404 Not Found`):**

```json
{
  "error": "Short URL not found"
}
```

## Design decisions

**Short code generation:** Random 7-character strings (base62: `a-z`, `A-Z`, `0-9`) generated with `nanoid`, giving roughly 3.5 trillion possible combinations. A collision-check-and-retry loop (capped at 5 attempts) guards against the extremely rare case of generating a code that's already in use.

**Duplicate URL handling:** Before generating a new code, the app checks whether the submitted URL has been shortened before (exact string match against the `original_url` column). If found, the existing short code is returned rather than creating a redundant entry.

**Exact match, not normalized match:** URLs are compared as exact strings. `https://example.com/page` and `https://example.com/page/` (trailing slash) are treated as different URLs. This is a deliberate scope decision for this version — see **Known limitations** below.

**Database:** SQLite via `better-sqlite3`, chosen for its synchronous API (no `async`/`await` needed for queries) and zero external setup — the entire database is a single file. Raw SQL is used directly rather than an ORM, since the project's data needs are simple (one table, three queries) and don't justify the added abstraction.

## Database schema

```sql
CREATE TABLE urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_code TEXT NOT NULL UNIQUE,
    original_url TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Both `short_code` and `original_url` carry `UNIQUE` constraints — enforcing, at the database level, the same uniqueness and deduplication rules the application logic already checks for.

## Known limitations / future improvements

- **No URL normalization** — trailing slashes, `http` vs `https`, and query parameter differences are all treated as distinct URLs. A future version could normalize URLs before comparison.
- **No handling for simultaneous duplicate submissions** — if two identical requests arrive at the exact same moment, both could pass the duplicate check before either inserts, causing the second insert to fail on the database's `UNIQUE` constraint. Low-probability at this scale, but worth hardening with a try/catch in a production setting.
- **No frontend yet** — the optional HTML form for submitting URLs will be added closer to submission for grading.

## Testing

All endpoints were manually tested via Postman and `curl`, covering:

- Successful URL shortening and redirect
- Duplicate URL submissions (confirming `200` vs `201` distinction)
- Invalid/missing input (`400` responses)
- Non-existent short codes (`404` responses)
- Case-sensitivity and special-character short codes
- Repeated identical submissions (confirming no duplicate rows are created)

## Author

Built by Samstar — CodeAlpha Backend Development Internship.
