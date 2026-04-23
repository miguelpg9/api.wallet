import { Router } from "express";
import {
  livenessCheck,
  readinessCheck,
} from "../controllers/healthcheckController";

const router = Router();

router.get("/liveness", livenessCheck);
router.get("/readiness", readinessCheck);

export default router;
