import { Brand } from "../models/Brand.js";
import { Campaign } from "../models/Campaign.js";
import { asyncHandler } from "../utils/asyncHandler.js";

async function myBrandId(userId) {
  const brand = await Brand.findOne({ userId }).select("_id");
  return brand?._id ?? null;
}

// GET /api/campaigns — campaigns owned by the signed-in brand
export const listMyCampaigns = asyncHandler(async (req, res) => {
  const brandId = await myBrandId(req.user._id);
  if (!brandId) return res.json([]);
  const campaigns = await Campaign.find({ brandId }).sort({ createdAt: -1 });
  res.json(campaigns);
});

// POST /api/campaigns
export const createCampaign = asyncHandler(async (req, res) => {
  const brandId = await myBrandId(req.user._id);
  if (!brandId) return res.status(404).json({ error: "No brand profile for this account" });

  const { title, brief, category, city, platform, budget, startsOn, endsOn, status } = req.body;
  if (!title) return res.status(400).json({ error: "title is required" });

  const campaign = await Campaign.create({
    brandId,
    title,
    brief,
    category,
    city,
    platform,
    budget,
    startsOn,
    endsOn,
    status,
  });
  res.status(201).json(campaign);
});

// PATCH /api/campaigns/:id
export const updateCampaign = asyncHandler(async (req, res) => {
  const brandId = await myBrandId(req.user._id);
  if (!brandId) return res.status(404).json({ error: "No brand profile for this account" });

  const allowed = ["title", "brief", "category", "city", "platform", "budget", "startsOn", "endsOn", "status"];
  const updates = {};
  for (const key of allowed) {
    if (key in req.body) updates[key] = req.body[key];
  }

  const campaign = await Campaign.findOneAndUpdate({ _id: req.params.id, brandId }, updates, {
    new: true,
    runValidators: true,
  });
  if (!campaign) return res.status(404).json({ error: "Campaign not found" });
  res.json(campaign);
});

// DELETE /api/campaigns/:id
export const deleteCampaign = asyncHandler(async (req, res) => {
  const brandId = await myBrandId(req.user._id);
  if (!brandId) return res.status(404).json({ error: "No brand profile for this account" });

  const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, brandId });
  if (!campaign) return res.status(404).json({ error: "Campaign not found" });
  res.status(204).send();
});
