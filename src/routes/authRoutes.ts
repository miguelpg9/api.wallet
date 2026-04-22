import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { validateBody } from "../middlewares/validationMiddleware";
import { login, register, getCurrentUser } from "../controllers/authController";
import { loginSchema, registerSchema } from "../validations/authSchemas";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);

router.get("/me", authenticateToken, getCurrentUser);

export default router;
