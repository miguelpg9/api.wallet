import { Op, fn, col } from "sequelize";
import { Category } from "../models/category";
import { Transaction } from "../models/transaction";
import { Errors } from "../utils/errors";

export const getAllTransactionsService = async ({
  userId,
  filters,
}: {
  userId: string;
  filters: any;
}) => {
  const {
    page,
    limit,
    type,
    categoryId,
    from,
    to,
    minAmount,
    maxAmount,
    search,
    sortBy,
    order,
    includeDeleted,
  } = filters;

  const offset = (page - 1) * limit;

  const where: any = {
    user_id: userId,
  };

  if (type) where.type = type;

  if (categoryId) {
    where.category_id = categoryId;
  }

  if (from || to) {
    where.date = {};
    if (from) where.date.$gte = from;
    if (to) where.date.$lte = to;
  }

  if (minAmount || maxAmount) {
    where.amount = {};
    if (minAmount) where.amount.$gte = minAmount;
    if (maxAmount) where.amount.$lte = maxAmount;
  }

  if (search) {
    where.description = {
      $iLike: `%${search}%`,
    };
  }

  const { rows, count } = await Transaction.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sortBy, order.toUpperCase()]],
    paranoid: !includeDeleted, // 🔥 clave
  });

  return {
    transactions: rows,
    total: count,
    page,
    limit,
  };
};

export const getTransactionByIdService = async ({
  userId,
  transactionId,
}: {
  userId: string;
  transactionId: string;
}) => {
  const transaction = await Transaction.findOne({
    where: {
      id: transactionId,
      user_id: userId,
      deleted_at: null,
    },
  });

  if (!transaction) {
    throw Errors.notFound("Transaction not found", "TRANSACTION_NOT_FOUND");
  }

  return transaction;
};

export const createTransactionService = async ({
  userId,
  transaction,
}: {
  userId: string;
  transaction: {
    amount: number;
    type: "income" | "expense";
    category_id: string;
    description?: string | null;
    date: Date;
  };
}) => {
  const category = await Category.findOne({
    where: {
      id: transaction.category_id,
      user_id: userId,
      deleted_at: null,
    },
  });

  if (!category) {
    throw Errors.badRequest("Invalid category", "INVALID_CATEGORY");
  }

  const created = await Transaction.create({
    amount: transaction.amount,
    type: transaction.type,
    category_id: transaction.category_id,
    description: transaction.description ?? null,
    date: new Date(transaction.date),
    user_id: userId,
  });

  return created;
};

export const updateTransactionService = async ({
  userId,
  transactionId,
  transaction,
}: {
  userId: string;
  transactionId: string;
  transaction: {
    amount?: number;
    type?: "income" | "expense";
    category_id?: string;
    description?: string | null;
    date?: Date;
  };
}) => {
  const transactionExist = await getTransactionByIdService({
    userId,
    transactionId,
  });
  if (!transactionExist) {
    throw Errors.notFound("Transaction not found", "TRANSACTION_NOT_FOUND");
  }

  const fieldsToUpdate: Partial<{
    amount: number;
    type: "income" | "expense";
    category_id: string;
    description: string | null;
    date: Date;
  }> = {};

  if (transaction.amount !== undefined)
    fieldsToUpdate.amount = transaction.amount;
  if (transaction.type !== undefined) fieldsToUpdate.type = transaction.type;
  if (transaction.category_id !== undefined) {
    const category = await Category.findOne({
      where: {
        id: transaction.category_id,
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!category) {
      throw Errors.badRequest("Invalid category", "INVALID_CATEGORY");
    }

    fieldsToUpdate.category_id = transaction.category_id;
  }
  if (transaction.description !== undefined)
    fieldsToUpdate.description = transaction.description;
  if (transaction.date !== undefined) fieldsToUpdate.date = transaction.date;

  if (Object.keys(fieldsToUpdate).length === 0) {
    throw Errors.badRequest("No fields to update", "BAD_REQUEST");
  }

  await transactionExist.update(fieldsToUpdate);
  return transactionExist;
};

export const deleteTransactionService = async ({
  userId,
  transactionId,
}: {
  userId: string;
  transactionId: string;
}) => {
  const transaction = await getTransactionByIdService({
    userId,
    transactionId,
  });

  if (!transaction) {
    throw Errors.notFound("Transaction not found", "TRANSACTION_NOT_FOUND");
  }
  
  await transaction.destroy();

  return;
};

export const restoreTransactionService = async ({
  userId,
  transactionId,
}: {
  userId: string;
  transactionId: string;
}) => {
  const transaction = await Transaction.findOne({
    where: {
      id: transactionId,
      user_id: userId,
    },
    paranoid: false,
  });

  if (!transaction) {
    throw Errors.notFound("Transaction not found", "TRANSACTION_NOT_FOUND");
  }

  if (!transaction.deleted_at) {
    throw Errors.badRequest("Transaction is not deleted");
  }

  await transaction.restore();

  return transaction;
};

export const getTransactionsSummaryService = async (userId: string) => {
  const transactions = await Transaction.findAll({
    where: {
      user_id: userId,
      deleted_at: null,
    },
    attributes: ["amount", "type"],
  });

  let income = 0;
  let expense = 0;

  for (const t of transactions) {
    if (t.type === "income") income += Number(t.amount);
    if (t.type === "expense") expense += Number(t.amount);
  }

  return {
    income,
    expense,
    balance: income - expense,
  };
};

export const getExpensesByCategoryService = async (userId: string) => {
  const results = await Transaction.findAll({
    where: {
      user_id: userId,
      deleted_at: null,
      type: "expense",
    },
    attributes: ["category_id", [fn("SUM", col("amount")), "total"]],
    group: ["category_id"],
    raw: true,
  });

  return results;
};

export const getExpensesByMonthService = async (userId: string) => {
  const results = await Transaction.findAll({
    where: {
      user_id: userId,
      deleted_at: null,
    },
    attributes: [
      [fn("DATE_TRUNC", "month", col("date")), "month"],
      [fn("SUM", col("amount")), "total"],
    ],
    group: ["month"],
    order: [["month", "ASC"]],
    raw: true,
  });

  return results;
};
