// shortenController.js

// Imports: db connection and the code generator
import db from "../db/db.js";
import generateUniqueCode from "../utils/generateCode.js";

// Prepared queries reused across requests
const findByOriginalUrl = db.prepare(
  "SELECT * FROM urls WHERE original_url = ?",
);
const insertUrl = db.prepare(
  "INSERT INTO urls (short_code, original_url) VALUES (?, ?)",
);

// Validates a string as a real URL using the built-in URL class
function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

// Builds the full short URL dynamically from the current request's host
function buildShortUrl(req, shortCode) {
  return `${req.protocol}://${req.get("host")}/${shortCode}`;
}

// Handles POST /api/shorten
function shortenUrl(req, res) {
  const { url } = req.body;

  // Validation: reject missing or malformed URLs
  if (!url || typeof url !== "string" || !isValidUrl(url)) {
    return res.status(400).json({ error: "A valid 'url' field is required" });
  }

  // Duplicate check: return existing record if this URL was shortened before
  const existing = findByOriginalUrl.get(url);

  if (existing) {
    return res.status(200).json({
      shortCode: existing.short_code,
      shortUrl: buildShortUrl(req, existing.short_code),
      originalUrl: existing.original_url,
    });
  }

  // New URL: generate a code, insert it, respond with 201
  const shortCode = generateUniqueCode();
  insertUrl.run(shortCode, url);

  return res.status(201).json({
    shortCode,
    shortUrl: buildShortUrl(req, shortCode),
    originalUrl: url,
  });
}

export default shortenUrl;
