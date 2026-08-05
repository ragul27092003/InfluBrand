import { User } from "../models/User.js";
import { Brand } from "../models/Brand.js";
import { Influencer } from "../models/Influencer.js";
import { Platform } from "../models/Platform.js";
import { Niche } from "../models/Niche.js";
import { signToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assertIdsExist } from "../utils/validateRefs.js";

// POST /api/auth/signup
// Creates the User plus its matching Brand or Influencer profile row,
// mirroring what the old Supabase `ensureAccountRecords()` trigger-on-login did —
// except here it happens once, atomically, at signup time.
export const signup = asyncHandler(async (req, res) => {
  const { email, password, accountType, fullName, phone, state, district, city, adminSecret } =
    req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  if (!["brand", "influencer", "admin"].includes(accountType)) {
    return res.status(400).json({ error: "accountType must be 'brand', 'influencer' or 'admin'" });
  }
  if (accountType === "admin") {
    if (!process.env.ADMIN_SIGNUP_SECRET || adminSecret !== process.env.ADMIN_SIGNUP_SECRET) {
      return res.status(403).json({ error: "Invalid admin invite code" });
    }
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  // Validate refs BEFORE creating the User — otherwise a bad platform/niche
  // id fails Influencer/Brand creation *after* the User is already saved,
  // leaving an orphaned User with no matching profile row.
  if (accountType === "influencer") {
    await assertIdsExist(Platform, req.body.platforms, "platform");
    await assertIdsExist(Niche, req.body.niches, "niche");
  } else if (accountType === "brand" && req.body.nicheId) {
    await assertIdsExist(Niche, req.body.nicheId, "niche");
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

  try {
    if (accountType === "brand") {
      const { companyName, website, nicheId, logoUrl } = req.body;
      await Brand.create({
        userId: user._id,
        companyName: companyName || fullName || "My brand",
        website: website || null,
        nicheId: nicheId || null,
        contactName: fullName || null,
        state: state || null,
        district: district || null,
        city: city || null,
        logoUrl: logoUrl || null,
      });
    } else if (accountType === "influencer") {
      const { handle, platforms, gender, niches, avatarUrl, followers, startingPrice } = req.body;
      await Influencer.create({
        userId: user._id,
        name: fullName || "New creator",
        state: state || null,
        district: district || null,
        city: city || district || "Mumbai",
        gender: gender || null,
        platforms: Array.isArray(platforms) ? platforms : [],
        handle: handle || null,
        niches: Array.isArray(niches) ? niches : [],
        avatarUrl: avatarUrl || null,
        followers: followers ? Number(followers) : 0,
        startingPrice: startingPrice ? Number(startingPrice) : null,
        isPublished: false,
      });
    }
    // accountType === "admin" needs no Brand/Influencer row — it just manages
    // the Platform/Niche catalog.
  } catch (err) {
    // Profile row failed after the User was already saved — roll the User
    // back so we don't leave a dangling account with no matching profile.
    await User.deleteOne({ _id: user._id });
    throw err;
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