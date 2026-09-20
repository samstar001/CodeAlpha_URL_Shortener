//DB.JS

import Database from "better-sqlite3"; // synchronous SQLite3 database driver for Node.js
import path from "path";
import { fileURLToPath } from "url";

// Replicate '__filename' and '__dirname' behaviors
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct an absolute path targeting the database file
const dbPath = path.join(__dirname, "..", "..", "database.db");
const db = new Database(dbPath);

// Execute a schema initialization query to set up the URL shortening table if it's missing
db.exec(`
  CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_code TEXT NOT NULL UNIQUE,
    original_url TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
