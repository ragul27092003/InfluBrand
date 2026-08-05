import { Router } from "express";
import {
  listMyCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  listCampaignApplicants,
  browseCampaigns,
} from "../controllers/campaigns.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// Open to any signed-in account (influencers browse campaigns to apply to).
router.get("/browse", requireAuth, browseCampaigns);

// Everything else is brand-only.
router.use(requireAuth, requireRole("brand"));
router.get("/", listMyCampaigns);
router.post("/", createCampaign);
router.patch("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);
router.get("/:id/applicants", listCampaignApplicants);

export default router;
