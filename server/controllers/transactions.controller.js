import { Transaction } from "../models/Transaction.js";
import { Influencer } from "../models/Influencer.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/transactions/me
export const getMyTransactions = asyncHandler(async (req, res) => {
  const influencer = await Influencer.findOne({ userId: req.user._id });
  if (!influencer) {
    return res.status(404).json({ error: "Influencer profile not found" });
  }

  const transactions = await Transaction.find({ influencerId: influencer._id })
    .populate("brandId", "companyName logoUrl")
    .sort({ createdAt: -1 });

  let available = 0;
  let pending = 0;
  let lifetime = 0;

  transactions.forEach((tx) => {
    if (tx.status === "cleared") {
      available += tx.amount;
      lifetime += tx.amount;
    } else if (tx.status === "pending") {
      pending += tx.amount;
    } else if (tx.status === "withdrawn") {
      lifetime += tx.amount;
    }
  });

  // ── Build real monthly earnings for the last 6 months ──────────────
  const now = new Date();
  const monthLabels = [];
  const monthlyEarnings = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

    const label = monthStart.toLocaleString("en-US", { month: "short" });
    monthLabels.push(label);

    // Sum amounts for all non-pending transactions in this month
    const total = transactions
      .filter((tx) => {
        const txDate = new Date(tx.createdAt);
        return txDate >= monthStart && txDate <= monthEnd && tx.status !== "pending";
      })
      .reduce((sum, tx) => sum + tx.amount, 0);

    monthlyEarnings.push(total);
  }

  // ── Compute real month-over-month growth % ─────────────────────────
  const thisMonth = monthlyEarnings[5]; // current month
  const lastMonth = monthlyEarnings[4]; // previous month
  let monthlyGrowth = 0;
  if (lastMonth > 0) {
    monthlyGrowth = Math.round(((thisMonth - lastMonth) / lastMonth) * 1000) / 10;
  } else if (thisMonth > 0) {
    monthlyGrowth = 100; // went from 0 → something
  }

  res.json({
    metrics: {
      available,
      pending,
      lifetime,
      monthlyGrowth,
    },
    monthlyChart: {
      labels: monthLabels,
      data: monthlyEarnings,
    },
    transactions,
  });
});

// POST /api/transactions/withdraw
export const withdrawFunds = asyncHandler(async (req, res) => {
  const influencer = await Influencer.findOne({ userId: req.user._id });
  if (!influencer) {
    return res.status(404).json({ error: "Influencer profile not found" });
  }

  // Find all "cleared" transactions and mark them as "withdrawn"
  const result = await Transaction.updateMany(
    { influencerId: influencer._id, status: "cleared" },
    { $set: { status: "withdrawn" } }
  );

  if (result.modifiedCount === 0) {
    return res.status(400).json({ error: "No cleared funds available for withdrawal." });
  }

  res.json({ message: `Successfully withdrew funds from ${result.modifiedCount} cleared transactions.` });
});
