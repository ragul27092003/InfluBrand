import { Router } from "express";
import {
  createShortlist,
  listMyShortlists,
  respondToShortlist,
} from "../controllers/shortlists.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", listMyShortlists);
router.post("/", requireRole("brand"), createShortlist);
router.patch("/:id", requireRole("influencer"), respondToShortlist);

export default router;
