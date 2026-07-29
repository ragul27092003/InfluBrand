import { Router } from "express";
import {
  listMyCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "../controllers/campaigns.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireRole("brand"));
router.get("/", listMyCampaigns);
router.post("/", createCampaign);
router.patch("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);

export default router;
