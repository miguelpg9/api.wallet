import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import {
  validateQuery,
  validateBody,
} from "../middlewares/validationMiddleware";
import {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionQuerySchema,
} from "../validations/transactionSchema";
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getExpensesByCategory,
  getExpensesByMonth,
} from "../controllers/transactionController";

const router = Router();

router.use(authenticateToken);

router.get("/", validateQuery(getTransactionQuerySchema), getAllTransactions);
router.get("/:id", getTransactionById);
router.post("/", validateBody(createTransactionSchema), createTransaction);
router.patch("/:id", validateBody(updateTransactionSchema), updateTransaction);
router.delete("/:id", deleteTransaction);
router.get("/summary", getSummary);
router.get("/by-category", getExpensesByCategory);
router.get("/by-month", getExpensesByMonth);

export default router;
