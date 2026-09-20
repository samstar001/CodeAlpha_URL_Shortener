// routes/shorten.js

// Imports: Express and the controller it maps to
import express from "express";
import shortenUrl from "../controllers/shortenController.js";

const router = express.Router();

// Maps POST /shorten (mounted under /api in server.js) to the controller
router.post("/shorten", shortenUrl);

export default router;
