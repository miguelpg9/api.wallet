import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { registerUser, loginUser, currentUser } from "../services/authService";
import { generateAccessToken } from "../services/tokenService";
import { Errors } from "../utils/errors";

const formatUser = (user: any) => ({
  id: user.id,
  firstname: user.firstname,
  lastname: user.lastname,
  email: user.email,
  created_at: user.created_at,
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { firstname, lastname, email, password } = req.validatedBody;

  const user = await registerUser({
    firstname,
    lastname,
    email,
    password,
  });

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  return res.status(201).json({
    accessToken,
    token_type: "Bearer",
    user: formatUser(user),
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.validatedBody;

  const user = await loginUser({ email, password });

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  return res.status(200).json({
    accessToken,
    token_type: "Bearer",
    user: formatUser(user),
  });
});

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      throw Errors.unauthorized("User not authenticated");
    }

    const user = await currentUser(req.user.userId);

    return res.status(200).json({
      user: formatUser(user),
    });
  },
);

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  return res.status(200).json({
    message: "Logged out successfully",
  });
});
