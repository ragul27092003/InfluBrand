import { User } from "../models/User.js";
import { Brand } from "../models/Brand.js";
import { Influencer } from "../models/Influencer.js";
import { signToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /api/auth/signup
// Creates the User plus its matching Brand or Influencer profile row,
// mirroring what the old Supabase `ensureAccountRecords()` trigger-on-login did —
// except here it happens once, atomically, at signup time.
export const signup = asyncHandler(async (req, res) => {
  const { email, password, accountType, fullName, phone, city } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  if (!["brand", "influencer"].includes(accountType)) {
    return res.status(400).json({ error: "accountType must be 'brand' or 'influencer'" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const user = new User({
    email,
    fullName: fullName || "",
    phone: phone || null,
    city: city || null,
    accountType,
  });
  await user.setPassword(password);
  await user.save();

  if (accountType === "brand") {
    const { companyName, website, industry, logoUrl } = req.body;
    await Brand.create({
      userId: user._id,
      companyName: companyName || fullName || "My brand",
      website: website || null,
      industry: industry || null,
      contactName: fullName || null,
      city: city || null,
      logoUrl: logoUrl || null,
    });
  } else {
    const { handle, platform, gender, categories, avatarUrl, followers, startingPrice } = req.body;
    await Influencer.create({
      userId: user._id,
      name: fullName || "New creator",
      city: city || "Mumbai",
      gender: gender || null,
      platform: platform || "instagram",
      handle: handle || null,
      categories: Array.isArray(categories) ? categories : [],
      avatarUrl: avatarUrl || null,
      followers: followers ? Number(followers) : 0,
      startingPrice: startingPrice ? Number(startingPrice) : null,
      isPublished: false,
    });
  }

  const token = signToken(user);
  res.status(201).json({ token, user: user.toPublicJSON() });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.checkPassword(password))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken(user);
  res.json({ token, user: user.toPublicJSON() });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});
