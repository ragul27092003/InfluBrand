import mongoose from "mongoose";

const influencerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, sparse: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    gender: { type: String, default: null },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: null },
    categories: { type: [String], default: [] },
    platform: { type: String, enum: ["instagram", "youtube", "tiktok"], default: "instagram" },
    handle: { type: String, default: null },
    followers: { type: Number, default: 0 },
    posts: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
    startingPrice: { type: Number, default: null },
    isVerified: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

influencerSchema.index({ followers: -1 });
influencerSchema.index({ isPublished: 1 });

export const Influencer = mongoose.model("Influencer", influencerSchema);
