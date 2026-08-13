import { User } from "../models/User.js";
import { Brand } from "../models/Brand.js";
import { Influencer } from "../models/Influencer.js";
import { Campaign } from "../models/Campaign.js";
import { Transaction } from "../models/Transaction.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/admin/stats
export const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalBrands,
    totalInfluencers,
    activeCampaigns,
    transactions
  ] = await Promise.all([
    User.countDocuments({ accountType: { $ne: "admin" } }),
    User.countDocuments({ accountType: "brand" }),
    User.countDocuments({ accountType: "influencer" }),
    Campaign.countDocuments({ status: "active" }),
    Transaction.find({ status: "cleared" })
  ]);

  const totalConnectsRevenue = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  res.json({
    totalUsers,
    totalBrands,
    totalInfluencers,
    activeCampaigns,
    totalConnectsRevenue
  });
});

// GET /api/admin/users
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = "", accountType = "all" } = req.query;
  
  const query = {};
  
  if (accountType !== "all") {
    query.accountType = accountType;
  } else {
    query.accountType = { $ne: "admin" }; // Hide other admins from list
  }

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await User.countDocuments(query);

  // Manually join avatars from Influencer and Brand collections
  const userIds = users.map(u => u._id);
  const influencers = await Influencer.find({ userId: { $in: userIds } }).select("userId avatarUrl");
  const brands = await Brand.find({ userId: { $in: userIds } }).select("userId logoUrl");

  const influencerMap = influencers.reduce((acc, inf) => { acc[inf.userId.toString()] = inf.avatarUrl; return acc; }, {});
  const brandMap = brands.reduce((acc, br) => { acc[br.userId.toString()] = br.logoUrl; return acc; }, {});

  res.json({
    users: users.map(u => {
      const pub = u.toPublicJSON();
      const id = u._id.toString();
      pub.avatarUrl = influencerMap[id] || brandMap[id] || pub.avatarUrl;
      return pub;
    }),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum)
  });
});

// PATCH /api/admin/users/:id/suspend
export const toggleUserSuspension = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isSuspended } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  
  if (user.accountType === "admin") {
    return res.status(403).json({ error: "Cannot suspend other admins" });
  }

  user.isSuspended = isSuspended;
  await user.save();

  res.json({ message: "User suspension updated", user: user.toPublicJSON() });
});

// GET /api/admin/users/:id/details
export const getUserDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  let profile = null;
  let campaigns = [];
  let transactions = [];

  if (user.accountType === "brand") {
    profile = await Brand.findOne({ userId: id }).populate("nicheId");
    campaigns = await Campaign.find({ brandId: id }).sort({ createdAt: -1 });
    transactions = await Transaction.find({ brandId: id }).sort({ createdAt: -1 });
  } else if (user.accountType === "influencer") {
    profile = await Influencer.findOne({ userId: id }).populate("niches platforms");
  }

  res.json({
    account: user.toPublicJSON(),
    profile,
    campaigns,
    transactions
  });
});

// PATCH /api/admin/users/:id
export const editUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullName, email, phone, city } = req.body;

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (user.accountType === "admin") {
    return res.status(403).json({ error: "Cannot edit other admins" });
  }

  if (email && email !== user.email) {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already in use" });
    user.email = email;
  }

  if (fullName !== undefined) user.fullName = fullName;
  if (phone !== undefined) user.phone = phone;
  if (city !== undefined) user.city = city;

  await user.save();
  res.json({ message: "User updated", user: user.toPublicJSON() });
});

// DELETE /api/admin/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  
  if (!user) return res.status(404).json({ error: "User not found" });
  
  if (user.accountType === "admin") {
    return res.status(403).json({ error: "Cannot delete admins" });
  }

  if (user.accountType === "brand") {
    await Brand.findOneAndDelete({ userId: id });
    await Campaign.deleteMany({ brandId: id });
  } else if (user.accountType === "influencer") {
    await Influencer.findOneAndDelete({ userId: id });
  }

  await User.findByIdAndDelete(id);
  res.json({ message: "User completely deleted" });
});

// POST /api/admin/users/:id/impersonate
import { signToken } from "../utils/jwt.js";

export const impersonateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.accountType === "admin") return res.status(403).json({ error: "Cannot impersonate admins" });

  const token = signToken(user);
  res.json({ token, user: user.toPublicJSON() });
});

// GET /api/admin/stats/historical
export const getHistoricalStats = asyncHandler(async (req, res) => {
  // Aggregate user growth over last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const usersAggr = await User.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo }, accountType: { $ne: "admin" } } },
    { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const transactionsAggr = await Transaction.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo }, status: "cleared" } },
    { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$amount" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    userGrowth: usersAggr,
    revenueGrowth: transactionsAggr
  });
});

// GET /api/admin/campaigns
export const getCampaigns = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = "", status = "all" } = req.query;
  
  const query = {};
  if (status !== "all") query.status = status;
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const campaigns = await Campaign.find(query)
    .populate("brandId", "companyName email logoUrl")
    .populate("platformId", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Campaign.countDocuments(query);

  res.json({
    campaigns,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum)
  });
});

// PATCH /api/admin/campaigns/:id/status
export const updateCampaignStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const campaign = await Campaign.findById(id);
  if (!campaign) return res.status(404).json({ error: "Campaign not found" });

  campaign.status = status;
  await campaign.save();

  res.json({ message: "Campaign status updated", campaign });
});

// GET /api/admin/transactions
export const getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = "" } = req.query;
  
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const query = {};
  if (search) {
    if (search.length === 24) {
      query._id = search;
    } else {
      const matchingBrands = await Brand.find({ companyName: { $regex: search, $options: "i" } });
      const brandIds = matchingBrands.map(b => b._id);
      query.brandId = { $in: brandIds };
    }
  }

  const transactions = await Transaction.find(query)
    .populate("brandId", "companyName email logoUrl")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Transaction.countDocuments(query);

  res.json({
    transactions,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum)
  });
});

// GET /api/admin/activity
export const getActivity = asyncHandler(async (req, res) => {
  // Fetch latest 5 users, campaigns, and transactions
  const [users, campaigns, transactions] = await Promise.all([
    User.find({ accountType: { $ne: "admin" } }).sort({ createdAt: -1 }).limit(10),
    Campaign.find().populate("brandId", "companyName").sort({ createdAt: -1 }).limit(10),
    Transaction.find({ status: "cleared" }).populate("brandId", "companyName").sort({ createdAt: -1 }).limit(10)
  ]);

  // Combine and sort by date
  const activity = [
    ...users.map(u => ({ type: "user_signup", date: u.createdAt, data: u.toPublicJSON() })),
    ...campaigns.map(c => ({ type: "campaign_created", date: c.createdAt, data: c })),
    ...transactions.map(t => ({ type: "transaction", date: t.createdAt, data: t }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);

  res.json(activity);
});
