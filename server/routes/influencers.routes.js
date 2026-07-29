import { Router } from "express";
import {
  listInfluencers,
  getInfluencer,
  getMyInfluencerProfile,
  updateMyInfluencerProfile,
} from "../controllers/influencers.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", listInfluencers);
router.get("/me", requireAuth, requireRole("influencer"), getMyInfluencerProfile);
router.patch("/me", requireAuth, requireRole("influencer"), updateMyInfluencerProfile);
router.get("/:id", getInfluencer);

export default router;
