// generateCode.js

// Imports: nanoid for random strings, db for checking collisions
import { nanoid } from "nanoid";
import db from "../db/db.js";

const CODE_LENGTH = 7;
const MAX_ATTEMPTS = 5;

// Reusable prepared query to check if a code already exists
const findByCode = db.prepare("SELECT id FROM urls WHERE short_code = ?");

// Generates a random code and retries on the rare chance of a collision
function generateUniqueCode() {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = nanoid(CODE_LENGTH);
    const existing = findByCode.get(code);

    if (!existing) {
      return code;
    }
  }

  // Fails loudly if we somehow can't find a free code after MAX_ATTEMPTS
  throw new Error(
    "Could not generate a unique short code after multiple attempts",
  );
}

export default generateUniqueCode;
