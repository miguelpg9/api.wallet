import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { registerUser, loginUser, currentUser } from "../services/authService";
import {
  generateAccessToken,
  generateRefreshToken,
  saveTokens,
  verifyRefreshToken,
  revokeRefreshToken,
} from "../services/tokenService";
import { Errors } from "../utils/errors";

const formatUser = (user: any) => ({
  id: user.id,
  firstname: user.firstname,
  lastname: user.lastname,
  email: user.email,
  created_at: user.created_at,
});
import { logger } from "../utils/logger";
import { success } from "zod";
import { successResponse } from "../utils/apiResponse";

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

  return res.status(201).json(
    successResponse({
      accessToken,
      token_type: "Bearer",
      user: formatUser(user),
    }),
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.validatedBody;

  const user = await loginUser({ email, password });

  logger.info({ userId: user.id, email: user.email }, "User logged in");

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
  });

  await saveTokens(user.id, refreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
  });

  return res.status(200).json(
    successResponse({
      accessToken,
      token_type: "Bearer",
      user: formatUser(user),
    }),
  );
});

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      throw Errors.unauthorized("User not authenticated", "UNAUTHORIZED");
    }

    const user = await currentUser(req.user.userId);

    return res.status(200).json(
      successResponse({
        user: formatUser(user),
      }),
    );
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  res.clearCookie("refreshToken", {
    path: "/api/auth",
  });

  return res.status(200).json(
    successResponse({
      message: "Logged out successfully",
    }),
  );
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw Errors.unauthorized("Refresh token missing");
  }

  const payload = await verifyRefreshToken(refreshToken);

  await revokeRefreshToken(refreshToken);

  const newRefreshToken = generateRefreshToken({
    userId: payload.userId,
    email: payload.email,
  });

  await saveTokens(payload.userId, newRefreshToken);

  const accessToken = generateAccessToken({
    userId: payload.userId,
    email: payload.email,
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
  });

  return res.status(200).json(
    successResponse({
      accessToken,
    }),
  );
});
