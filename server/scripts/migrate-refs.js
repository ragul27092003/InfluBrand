// Converts OLD dummy-data string values (platform: "instagram",
// categories: ["Fashion", "Food"], industry: "Fashion") into the NEW
// Platform/Niche ObjectId references, on documents that already exist in
// the database. Run this ONCE after deploying the new schema + seeding
// Platforms/Niches:
//
//   npm run seed            # first — creates the base Platform/Niche docs
//   npm run migrate:refs    # then — rewires existing documents to use ids
//
// Safe to re-run: any document that's already using an ObjectId (or has no
// legacy field) is skipped.
import "dotenv/config";
import mongoose from "mongoose";

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function findOrCreatePlatformId(db, platformCache, rawValue) {
  if (!rawValue || typeof rawValue !== "string") return null;
  const slug = slugify(rawValue);
  if (platformCache.has(slug)) return platformCache.get(slug);

  const platforms = db.collection("platforms");
  let doc = await platforms.findOne({ slug });
  if (!doc) {
    const insertResult = await platforms.insertOne({
      name: rawValue,
      slug,
      icon: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    doc = { _id: insertResult.insertedId };
    console.log(`[migrate] created missing platform "${rawValue}"`);
  }
  platformCache.set(slug, doc._id);
  return doc._id;
}

async function findOrCreateNicheId(db, nicheCache, rawValue) {
  if (!rawValue || typeof rawValue !== "string") return null;
  const slug = slugify(rawValue);
  if (nicheCache.has(slug)) return nicheCache.get(slug);

  const niches = db.collection("niches");
  let doc = await niches.findOne({ slug });
  if (!doc) {
    const insertResult = await niches.insertOne({
      name: rawValue,
      slug,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    doc = { _id: insertResult.insertedId };
    console.log(`[migrate] created missing niche "${rawValue}"`);
  }
  nicheCache.set(slug, doc._id);
  return doc._id;
}

async function migrateInfluencers(db) {
  const col = db.collection("influencers");
  const platformCache = new Map();
  const nicheCache = new Map();

  // Only touch documents that still have the OLD string fields.
  const cursor = col.find({
    $or: [{ platform: { $type: "string" } }, { categories: { $type: "array" } }],
  });

  let count = 0;
  for await (const doc of cursor) {
    const update = {};
    const unset = {};

    if (typeof doc.platform === "string") {
      update.platformId = await findOrCreatePlatformId(db, platformCache, doc.platform);
      unset.platform = "";
    }

    if (Array.isArray(doc.categories)) {
      const ids = [];
      for (const cat of doc.categories) {
        const id = await findOrCreateNicheId(db, nicheCache, cat);
        if (id) ids.push(id);
      }
      update.niches = ids;
      unset.categories = "";
    }

    await col.updateOne({ _id: doc._id }, { $set: update, $unset: unset });
    count += 1;
  }
  console.log(`[migrate] influencers: updated ${count} document(s)`);
}

async function migrateBrands(db) {
  const col = db.collection("brands");
  const nicheCache = new Map();

  const cursor = col.find({ industry: { $type: "string" } });
  let count = 0;
  for await (const doc of cursor) {
    const nicheId = await findOrCreateNicheId(db, nicheCache, doc.industry);
    await col.updateOne({ _id: doc._id }, { $set: { nicheId }, $unset: { industry: "" } });
    count += 1;
  }
  console.log(`[migrate] brands: updated ${count} document(s)`);
}

async function migrateCampaigns(db) {
  const col = db.collection("campaigns");
  const platformCache = new Map();
  const nicheCache = new Map();

  const cursor = col.find({
    $or: [{ platform: { $type: "string" } }, { category: { $type: "string" } }],
  });

  let count = 0;
  for await (const doc of cursor) {
    const update = {};
    const unset = {};

    if (typeof doc.platform === "string") {
      update.platformId = await findOrCreatePlatformId(db, platformCache, doc.platform);
      unset.platform = "";
    }
    if (typeof doc.category === "string") {
      update.nicheId = await findOrCreateNicheId(db, nicheCache, doc.category);
      unset.category = "";
    }

    await col.updateOne({ _id: doc._id }, { $set: update, $unset: unset });
    count += 1;
  }
  console.log(`[migrate] campaigns: updated ${count} document(s)`);
}

async function migrate() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI env variable. Copy .env.example → .env and set it.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  console.log(`[migrate] connected to MongoDB (${db.databaseName})`);

  await migrateInfluencers(db);
  await migrateBrands(db);
  await migrateCampaigns(db);

  await mongoose.disconnect();
  console.log("[migrate] done");
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
