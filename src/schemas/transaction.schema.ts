import { z } from "zod";

export const TransactionTypeEnum = z.enum(["income", "expense"]);

const positiveNumber = z.coerce
  .number()
  .positive("Amount must be a positive number");

const validDate = z.coerce
  .date()
  .refine((date) => !isNaN(date.getTime()), { message: "Invalid date format" });

const descriptionRegex = /^[\w\sÁÉÍÓÚáéíóúÑñ.,#'-]+$/;

export const createTransactionSchema = z
  .object({
    amount: positiveNumber,
    type: TransactionTypeEnum,
    categoryId: z.string().min(1, "categoryId is required"),

    description: z
      .string()
      .max(255)
      .regex(descriptionRegex, "Invalid characters in description")
      .optional()
      .or(z.literal("")),

    date: validDate,
  })
  .strict();

export const updateTransactionSchema = z
  .object({
    amount: positiveNumber.optional(),
    type: TransactionTypeEnum.optional(),
    categoryId: z.string().min(1).optional(),
    description: z
      .string()
      .max(255)
      .regex(descriptionRegex, "Invalid characters in description")
      .optional()
      .or(z.literal("")),

    date: validDate.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const transactionParamsSchema = z.object({
  id: z.string().min(1, "Transaction ID is required"),
});

export const transactionQuerySchema = z
  .object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    type: TransactionTypeEnum.optional(),
    categoryId: z
      .string()
      .transform((val) => val.split(","))
      .optional(),
    from: validDate.optional(),
    to: validDate.optional(),
    minAmount: z.coerce.number().optional(),
    maxAmount: z.coerce.number().optional(),
    search: z.string().max(100).optional(),
    sortBy: z.enum(["date", "amount", "created_at"]).default("date"),
    order: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict()
  .refine(
    (data) => {
      if (data.from && data.to) return data.from <= data.to;
      return true;
    },
    {
      message: "'from' must be <= 'to'",
      path: ["from"],
    },
  )
  .refine(
    (data) => {
      if (data.minAmount && data.maxAmount) {
        return data.minAmount <= data.maxAmount;
      }
      return true;
    },
    {
      message: "minAmount must be <= maxAmount",
      path: ["minAmount"],
    },
  );
