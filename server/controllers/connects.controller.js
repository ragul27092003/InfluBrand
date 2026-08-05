import { Brand } from "../models/Brand.js";
import { ConnectPurchase } from "../models/ConnectPurchase.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// INR pricing — connect packages a brand can buy to unlock applicant contact
// details. Kept server-side so the client can never tamper with price.
export const CONNECT_PACKAGES = [
  { key: "starter", connects: 10, priceInr: 399 },
  { key: "growth", connects: 25, priceInr: 899 },
  { key: "pro", connects: 50, priceInr: 1499 },
  { key: "best-value", connects: 100, priceInr: 2499, bestValue: true },
];

function findBrand(userId) {
  return Brand.findOne({ userId }).select("_id connectBalance");
}

function purchaseToClientShape(doc) {
  return {
    id: doc._id.toString(),
    date: doc.createdAt,
    description: `${doc.connects} Connects Package`,
    connects: doc.connects,
    amountInr: doc.amountInr,
    status: doc.status,
  };
}

// GET /api/connects/packages
export const listPackages = asyncHandler(async (req, res) => {
  const brand = await findBrand(req.user._id);
  if (!brand) return res.status(404).json({ error: "Your brand profile is still being set up. Try again in a moment." });
  res.json({ packages: CONNECT_PACKAGES, connectBalance: brand.connectBalance });
});

// POST /api/connects/purchase  { packageKey }
export const purchaseConnects = asyncHandler(async (req, res) => {
  const brand = await findBrand(req.user._id);
  if (!brand) return res.status(404).json({ error: "Your brand profile is still being set up. Try again in a moment." });

  const pkg = CONNECT_PACKAGES.find((p) => p.key === req.body.packageKey);
  if (!pkg) return res.status(400).json({ error: "Unknown connects package" });

  const purchase = await ConnectPurchase.create({
    brandId: brand._id,
    packageKey: pkg.key,
    connects: pkg.connects,
    amountInr: pkg.priceInr,
  });

  brand.connectBalance = (brand.connectBalance || 0) + pkg.connects;
  await brand.save();

  res.status(201).json({ purchase: purchaseToClientShape(purchase), connectBalance: brand.connectBalance });
});

// GET /api/connects/purchases — used by both Connect Purchase History and
// Package Purchase History (same underlying transactions today).
export const listPurchases = asyncHandler(async (req, res) => {
  const brand = await findBrand(req.user._id);
  if (!brand) return res.json([]);
  const purchases = await ConnectPurchase.find({ brandId: brand._id }).sort({ createdAt: -1 });
  res.json(purchases.map(purchaseToClientShape));
});

// GET /api/connects/wallet — ledger view: every purchase credits connects,
// running balance shown alongside each entry.
export const listWallet = asyncHandler(async (req, res) => {
  const brand = await findBrand(req.user._id);
  if (!brand) return res.json([]);
  const purchases = await ConnectPurchase.find({ brandId: brand._id }).sort({ createdAt: 1 });

  let running = 0;
  const ledger = purchases.map((p) => {
    running += p.connects;
    return {
      id: p._id.toString(),
      date: p.createdAt,
      description: `${p.connects} Connects Added`,
      debited: null,
      credited: p.connects,
      closingBalance: running,
    };
  });

  res.json(ledger.reverse());
});
