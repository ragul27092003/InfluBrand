import mongoose from "mongoose";

const shortlistSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", default: null },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
    influencerId: { type: mongoose.Schema.Types.ObjectId, ref: "Influencer", required: true },
    kind: { type: String, enum: ["shortlist", "offer"], default: "shortlist" },
    response: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
    note: { type: String, default: null },
  },
  { timestamps: true }
);

// Mirrors the Supabase UNIQUE (brand_id, influencer_id, campaign_id) constraint
shortlistSchema.index({ brandId: 1, influencerId: 1, campaignId: 1 }, { unique: true });

export const Shortlist = mongoose.model("Shortlist", shortlistSchema);
