import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.routes.js";
import influencersRoutes from "./routes/influencers.routes.js";
import brandsRoutes from "./routes/brands.routes.js";
import campaignsRoutes from "./routes/campaigns.routes.js";
import shortlistsRoutes from "./routes/shortlists.routes.js";
import messagesRoutes from "./routes/messages.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const PORT = process.env.PORT || 4000;

// ── MongoDB connection ──────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI env variable. Copy .env.example → .env and set it.");
  process.exit(1);
}

// ── Express app ─────────────────────────────────────────────────
const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// ── Routes ──────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/influencers", influencersRoutes);
app.use("/api/brands", brandsRoutes);
app.use("/api/campaigns", campaignsRoutes);
app.use("/api/shortlists", shortlistsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/contact", contactRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// ── Start ───────────────────────────────────────────────────────
mongoose.set("strictQuery", true);
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(`[db] connected to MongoDB (${mongoose.connection.name})`);
    app.listen(PORT, () => {
      console.log(`[server] Influbrand API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[server] failed to start:", err);
    process.exit(1);
  });
