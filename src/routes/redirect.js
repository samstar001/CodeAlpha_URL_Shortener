// routes/redirect.js

// Imports: Express and the controller it maps to
import express from "express";
import redirectToOriginal from "../controllers/redirectController.js";

const router = express.Router();

// Maps GET /:shortCode (mounted at root in server.js) to the controller
router.get("/:shortCode", redirectToOriginal);

export default router;
