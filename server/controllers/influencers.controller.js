import { Influencer } from "../models/Influencer.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function toClientShape(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    city: doc.city,
    bio: doc.bio,
    avatarUrl: doc.avatarUrl,
    categories: doc.categories,
    platform: doc.platform,
    handle: doc.handle,
    followers: doc.followers,
    posts: doc.posts,
    likes: doc.likes,
    engagement: doc.engagement,
    starting_price: doc.startingPrice,
    is_verified: doc.isVerified,
  };
}

// GET /api/influencers — public directory, published only
// (equivalent to the old listInfluencers() server function against Supabase)
export const listInfluencers = asyncHandler(async (req, res) => {
  const docs = await Influencer.find({ isPublished: true }).sort({ followers: -1 });
  res.json(docs.map(toClientShape));
});

// GET /api/influencers/:id
export const getInfluencer = asyncHandler(async (req, res) => {
  const doc = await Influencer.findById(req.params.id);
  if (!doc || !doc.isPublished) {
    return res.status(404).json({ error: "Influencer not found" });
  }
  res.json(toClientShape(doc));
});

// GET /api/influencers/me — the signed-in creator's own listing (published or not)
export const getMyInfluencerProfile = asyncHandler(async (req, res) => {
  const doc = await Influencer.findOne({ userId: req.user._id });
  if (!doc) return res.status(404).json({ error: "No influencer profile for this account" });
  res.json(doc);
});

// PATCH /api/influencers/me — creator edits their own listing
export const updateMyInfluencerProfile = asyncHandler(async (req, res) => {
  const allowed = [
    "name",
    "city",
    "gender",
    "bio",
    "avatarUrl",
    "categories",
    "platform",
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

  const doc = await Influencer.findOneAndUpdate({ userId: req.user._id }, updates, {
    new: true,
    runValidators: true,
  });
  if (!doc) return res.status(404).json({ error: "No influencer profile for this account" });
  res.json(doc);
});
