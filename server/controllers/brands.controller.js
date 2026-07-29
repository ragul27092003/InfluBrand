import { Brand } from "../models/Brand.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/brands/me
export const getMyBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ userId: req.user._id });
  if (!brand) return res.status(404).json({ error: "No brand profile for this account" });
  res.json(brand);
});

// PATCH /api/brands/me
export const updateMyBrand = asyncHandler(async (req, res) => {
  const allowed = ["companyName", "website", "industry", "contactName", "city", "about", "logoUrl"];
  const updates = {};
  for (const key of allowed) {
    if (key in req.body) updates[key] = req.body[key];
  }

  const brand = await Brand.findOneAndUpdate({ userId: req.user._id }, updates, {
    new: true,
    runValidators: true,
  });
  if (!brand) return res.status(404).json({ error: "No brand profile for this account" });
  res.json(brand);
});
