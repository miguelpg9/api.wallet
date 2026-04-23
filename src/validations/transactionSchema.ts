import { z } from "zod";

const typeEnum = z.enum(["income", "expense"]);

export const createTransactionSchema = z
  .object({
    amount: z.number().positive("Amount must be greater than 0"),
    type: typeEnum,
    categoryId: z.string().uuid("Invalid category id"),
    description: z.string().trim().max(255).optional().nullable(),
    date: z.string().datetime("Invalid date format"),
  })
  .strict();

export const updateTransactionSchema = createTransactionSchema
  .partial()
  .strict();

export const getTransactionQuerySchema = z
  .object({
    type: typeEnum.optional(),
    categoryId: z.string().uuid().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    page: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : 10)),
  })
  .strict();
