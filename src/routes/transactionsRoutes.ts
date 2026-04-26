import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import {
  validateQuery,
  validateBody,
  validateParams,
} from "../middlewares/validationMiddleware";
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
  transactionParamsSchema,
} from "../schemas/transaction.schema";
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  restoreTransaction,
  getSummary,
  getExpensesByCategory,
  getExpensesByMonth,
} from "../controllers/transactionController";

const router = Router();

router.use(authenticateToken);

router.post("/", validateBody(createTransactionSchema), createTransaction);
router.get("/", validateQuery(transactionQuerySchema), getAllTransactions);
router.get("/:id", validateParams(transactionParamsSchema), getTransactionById);
router.patch(
  "/:id",
  validateParams(transactionParamsSchema),
  validateBody(updateTransactionSchema),
  updateTransaction,
);
router.delete(
  "/:id",
  validateParams(transactionParamsSchema),
  deleteTransaction,
);
router.post(
  "/:id/restore",
  validateParams(transactionParamsSchema),
  restoreTransaction,
);
router.get("/summary", getSummary);
router.get("/by-category", getExpensesByCategory);
router.get("/by-month", getExpensesByMonth);

export default router;
