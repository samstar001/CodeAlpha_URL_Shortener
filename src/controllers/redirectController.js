// redirectController.js

// Import the db connection
import db from "../db/db.js";

// Prepared query to look up a short code
const findByCode = db.prepare(
  "SELECT original_url FROM urls WHERE short_code = ?",
);

// Handles GET /:shortCode
function redirectToOriginal(req, res) {
  const { shortCode } = req.params;

  const row = findByCode.get(shortCode);

  if (!row) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  // res.redirect defaults to 302 (temporary), which fits since the mapping could change
  return res.redirect(row.original_url);
}

export default redirectToOriginal;
