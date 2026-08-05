import { Influencer } from "../models/Influencer.js";
import { Platform } from "../models/Platform.js";
import { Niche } from "../models/Niche.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assertIdsExist } from "../utils/validateRefs.js";

function toClientShape(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    state: doc.state,
    district: doc.district,
    city: doc.city,
    bio: doc.bio,
    avatarUrl: doc.avatarUrl,
    niches: doc.niches, // populated Niche docs ({ id, name, slug }) or raw ids
    platforms: doc.platforms, // populated Platform docs ({ id, name, slug, icon }) or raw ids
    handle: doc.handle,
    followers: doc.followers,
    posts: doc.posts,
    likes: doc.likes,
    engagement: doc.engagement,
    starting_price: doc.startingPrice,
    is_verified: doc.isVerified,
  };
}

const POPULATE = [
  { path: "niches", select: "name slug" },
  { path: "platforms", select: "name slug icon" },
];

// GET /api/influencers — public directory, published only
// Supports optional filtering: ?platform=<platformId>&niche=<nicheId>&state=<TN>&district=<Madurai>
export const listInfluencers = asyncHandler(async (req, res) => {
  const query = { isPublished: true };
  if (req.query.platform) query.platforms = req.query.platform;
  if (req.query.niche) query.niches = req.query.niche;
  if (req.query.state) query.state = req.query.state.toUpperCase();
  if (req.query.district) query.district = req.query.district;

  const docs = await Influencer.find(query).sort({ followers: -1 }).populate(POPULATE);
  res.json(docs.map(toClientShape));
});

// GET /api/influencers/:id
export const getInfluencer = asyncHandler(async (req, res) => {
  const doc = await Influencer.findById(req.params.id).populate(POPULATE);
  if (!doc || !doc.isPublished) {
    return res.status(404).json({ error: "Influencer not found" });
  }
  res.json(toClientShape(doc));
});

// GET /api/influencers/me — the signed-in creator's own listing (published or not)
export const getMyInfluencerProfile = asyncHandler(async (req, res) => {
  const doc = await Influencer.findOne({ userId: req.user._id }).populate(POPULATE);
  if (!doc) return res.status(404).json({ error: "No influencer profile for this account" });
  res.json(doc);
});

// PATCH /api/influencers/me — creator edits their own listing
export const updateMyInfluencerProfile = asyncHandler(async (req, res) => {
  const allowed = [
    "name",
    "state",
    "district",
    "city",
    "gender",
    "bio",
    "avatarUrl",
    "niches", // array of Niche ids
    "platforms", // array of Platform ids
    "handle",
    "followers",
    "posts",
    "likes",
    "engagement",
    "startingPrice",
    "isPublished",
  ];
  const updates = {};
  for (const key of allowed) {
    if (key in req.body) updates[key] = req.body[key];
  }

  await assertIdsExist(Niche, updates.niches, "niche");
  await assertIdsExist(Platform, updates.platforms, "platform");

  const doc = await Influencer.findOneAndUpdate({ userId: req.user._id }, updates, {
    new: true,
    runValidators: true,
  }).populate(POPULATE);
  if (!doc) return res.status(404).json({ error: "No influencer profile for this account" });
  res.json(doc);
});
