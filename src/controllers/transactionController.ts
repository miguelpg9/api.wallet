import { asyncHandler } from "../middlewares/asyncHandler";
import { Request, Response } from "express";
import {
  getAllTransactionsService,
  getTransactionByIdService,
  createTransactionService,
  updateTransactionService,
  deleteTransactionService,
  getTransactionsSummaryService,
  getExpensesByCategoryService,
  getExpensesByMonthService,
} from "../services/transactionService";
import { Errors } from "../utils/errors";
import { successResponse } from "../utils/apiResponse";

export const getAllTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    const result = await getAllTransactionsService({
      userId,
      filters: req.query,
    });

    return res.status(200).json(
      successResponse({
        items: result.transactions,
        total: result.total,
        page: result.page,
        limit: result.limit,
      }),
    );
  },
);

export const getTransactionById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;

    if (!id || Array.isArray(id)) {
      throw Errors.badRequest("Invalid transaction id", "BAD_REQUEST");
    }

    const transaction = await getTransactionByIdService({
      userId,
      transactionId: id,
    });

    return res.status(200).json(
      successResponse({
        transaction,
      }),
    );
  },
);

export const createTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const body = req.validatedBody;
    const { amount, type, category_id, description, date } = body;

    const transaction = await createTransactionService({
      userId,
      transaction: { amount, type, category_id, description, date },
    });

    return res.status(201).json(
      successResponse({
        transaction,
      }),
    );
  },
);

export const updateTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const body = req.validatedBody;
    const { amount, type, category_id, description, date } = body;
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      throw Errors.badRequest("Invalid transaction id", "BAD_REQUEST");
    }

    const transaction = await updateTransactionService({
      userId,
      transactionId: id,
      transaction: {
        amount,
        type,
        category_id,
        description,
        date: date ? new Date(date) : undefined,
      },
    });

    return res.status(200).json(
      successResponse({
        transaction,
      }),
    );
  },
);

export const deleteTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      throw Errors.badRequest("Invalid transaction id", "BAD_REQUEST");
    }

    await deleteTransactionService({
      userId,
      transactionId: id,
    });

    return res.status(204).json(
      successResponse({
        message: "Transaction deleted successfully",
        code: "SUCCESS",
      }),
    );
  },
);

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const summary = await getTransactionsSummaryService(userId);

  return res.status(200).json(successResponse(summary));
});

export const getExpensesByCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const data = await getExpensesByCategoryService(userId);

    return res.status(200).json(successResponse(data));
  },
);

export const getExpensesByMonth = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const data = await getExpensesByMonthService(userId);

    return res.status(200).json(successResponse(data));
  },
);
