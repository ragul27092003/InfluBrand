import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: { type: String, required: true },
    website: { type: String, default: null },
    industry: { type: String, default: null },
    contactName: { type: String, default: null },
    city: { type: String, default: null },
    about: { type: String, default: null },
    logoUrl: { type: String, default: null },
    connectBalance: { type: Number, default: 2 },
  },
  { timestamps: true }
);

export const Brand = mongoose.model("Brand", brandSchema);
