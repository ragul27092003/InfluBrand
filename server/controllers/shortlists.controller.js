import { Brand } from "../models/Brand.js";
import { Influencer } from "../models/Influencer.js";
import { Shortlist } from "../models/Shortlist.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /api/shortlists — brand shortlists/offers an influencer, OR an
// influencer applies to a brand's campaign (kind: "application").
export const createShortlist = asyncHandler(async (req, res) => {
  const { influencerId, campaignId, kind, note } = req.body;

  if (req.user.accountType === "influencer") {
    // Influencer applying to a campaign: infer influencerId + brandId, ignore any passed influencerId.
    const influencer = await Influencer.findOne({ userId: req.user._id }).select("_id");
    if (!influencer) {
      return res.status(404).json({ error: "Your influencer profile is still being set up. Try again in a moment." });
    }
    if (!campaignId) return res.status(400).json({ error: "campaignId is required" });

    const { Campaign } = await import("../models/Campaign.js");
    const campaign = await Campaign.findById(campaignId).select("_id brandId");
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    const shortlist = await Shortlist.create({
      brandId: campaign.brandId,
      influencerId: influencer._id,
      campaignId: campaign._id,
      kind: "application",
      note: note || null,
    });
    return res.status(201).json(shortlist);
  }

  const brand = await Brand.findOne({ userId: req.user._id }).select("_id");
  if (!brand) {
    return res.status(404).json({ error: "Your brand profile is still being set up. Try again in a moment." });
  }

  if (!influencerId) return res.status(400).json({ error: "influencerId is required" });

  const influencer = await Influencer.findById(influencerId).select("_id name");
  if (!influencer) return res.status(404).json({ error: "Influencer not found" });

  const shortlist = await Shortlist.create({
    brandId: brand._id,
    influencerId,
    campaignId: campaignId || null,
    kind: kind === "offer" ? "offer" : "shortlist",
    note: note || null,
  });

  res.status(201).json(shortlist);
});

// GET /api/shortlists — for a brand: everything they've shortlisted/offered.
// For an influencer: shortlists/offers they've received.
export const listMyShortlists = asyncHandler(async (req, res) => {
  if (req.user.accountType === "brand") {
    const brand = await Brand.findOne({ userId: req.user._id }).select("_id");
    if (!brand) return res.json([]);
    const shortlists = await Shortlist.find({ brandId: brand._id })
      .populate("influencerId", "name city platformId handle avatarUrl")
      .sort({ createdAt: -1 });
    return res.json(shortlists);
  }

  const influencer = await Influencer.findOne({ userId: req.user._id }).select("_id");
  if (!influencer) return res.json([]);
  const shortlists = await Shortlist.find({ influencerId: influencer._id })
    .populate("brandId", "companyName city logoUrl")
    .sort({ createdAt: -1 });
  res.json(shortlists);
});

// PATCH /api/shortlists/:id — influencer accepts/declines an offer
export const respondToShortlist = asyncHandler(async (req, res) => {
  const influencer = await Influencer.findOne({ userId: req.user._id }).select("_id");
  if (!influencer) return res.status(404).json({ error: "No influencer profile for this account" });

  const { response } = req.body;
  if (!["accepted", "declined", "pending"].includes(response)) {
    return res.status(400).json({ error: "response must be 'accepted', 'declined' or 'pending'" });
  }

  const shortlist = await Shortlist.findOneAndUpdate(
    { _id: req.params.id, influencerId: influencer._id },
    { response },
    { new: true }
  );
  if (!shortlist) return res.status(404).json({ error: "Shortlist entry not found" });
  res.json(shortlist);
});
