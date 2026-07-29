import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
    title: { type: String, required: true },
    brief: { type: String, default: null },
    category: { type: String, default: null },
    city: { type: String, default: null },
    platform: { type: String, enum: ["instagram", "youtube"], default: "instagram" },
    budget: { type: Number, default: null },
    startsOn: { type: Date, default: null },
    endsOn: { type: Date, default: null },
    status: { type: String, enum: ["draft", "active", "paused", "completed"], default: "draft" },
  },
  { timestamps: true }
);

export const Campaign = mongoose.model("Campaign", campaignSchema);
