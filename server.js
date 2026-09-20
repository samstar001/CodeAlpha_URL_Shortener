// server.js

// Imports: Express and the two route files
import express from "express";
import shortenRoutes from "./src/routes/shorten.js";
import redirectRoutes from "./src/routes/redirect.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: parses incoming JSON bodies into req.body
app.use(express.json());

// Mounts shortenRoutes under /api, so "/shorten" becomes "/api/shorten"
app.use("/api", shortenRoutes);

// Mounts redirectRoutes at root — must come AFTER /api or it'll swallow those routes too
app.use("/", redirectRoutes);

app.listen(PORT, () => {
  console.log(`URL shortener running at http://localhost:${PORT}`);
});
