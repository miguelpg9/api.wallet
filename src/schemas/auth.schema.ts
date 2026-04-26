import { z } from "zod";

const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/;

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address")
      .max(255),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).+$/,
        "Password must contain at least one letter and one number",
      ),

    firstname: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(100)
      .regex(nameRegex, "Invalid characters in first name"),

    lastname: z
      .string()
      .trim()
      .min(1, "Last name is required")
      .max(100)
      .regex(nameRegex, "Invalid characters in last name"),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address")
      .max(255),

    password: z.string().min(1, "Password is required"),
  })
  .strict();
