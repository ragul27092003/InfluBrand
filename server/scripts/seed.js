// One-time seed for Platforms & Niches. Safe to re-run — uses upsert so it
// won't duplicate entries. Run with: npm run seed
import "dotenv/config";
import mongoose from "mongoose";
import { Platform } from "../models/Platform.js";
import { Niche } from "../models/Niche.js";

const PLATFORMS = [
  { name: "Instagram", icon: "instagram" },
  { name: "YouTube", icon: "youtube" },
  { name: "TikTok", icon: "music-2" },
  { name: "Facebook", icon: "facebook" },
  { name: "X (Twitter)", icon: "twitter" },
  { name: "LinkedIn", icon: "linkedin" },
];

const NICHES = [
  "Fashion",
  "Food",
  "Tech",
  "Travel",
  "Beauty",
  "Fitness",
  "Gaming",
  "Comedy",
  "Education",
  "Lifestyle",
];

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI env variable. Copy .env.example → .env and set it.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log(`[seed] connected to MongoDB (${mongoose.connection.name})`);

  for (const p of PLATFORMS) {
    await Platform.findOneAndUpdate(
      { slug: slugify(p.name) },
      { name: p.name, slug: slugify(p.name), icon: p.icon },
      { upsert: true, new: true }
    );
  }
  console.log(`[seed] upserted ${PLATFORMS.length} platforms`);

  for (const n of NICHES) {
    await Niche.findOneAndUpdate(
      { slug: slugify(n) },
      { name: n, slug: slugify(n) },
      { upsert: true, new: true }
    );
  }
  console.log(`[seed] upserted ${NICHES.length} niches`);

  await mongoose.disconnect();
  console.log("[seed] done");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
