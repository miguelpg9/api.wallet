import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { validateBody } from "../middlewares/validationMiddleware";
import {
  login,
  register,
  getCurrentUser,
  logout,
  refresh,
} from "../controllers/authController";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { authLimiter } from "../middlewares/securityMiddleware";

const router = Router();

router.post("/register", validateBody(registerSchema), authLimiter, register);
router.post("/login", validateBody(loginSchema), authLimiter, login);
router.post("/refresh", authLimiter, refresh);
router.post("/logout", authenticateToken, logout);
router.get("/me", authenticateToken, getCurrentUser);

export default router;
