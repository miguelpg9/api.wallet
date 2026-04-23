import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Token } from "../models/token";
import { Errors } from "../utils/errors";

const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

if (!JWT_SECRET || !REFRESH_SECRET) {
  throw new Error("JWT secrets not defined");
}

export const generateAccessToken = (payload: {
  userId: string;
  email: string;
}) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1h",
  });
};

export const generateRefreshToken = (payload: {
  userId: string;
  email: string;
}) => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export const saveTokens = async (userId: string, refreshToken: string) => {
  const hashed = await bcrypt.hash(refreshToken, 10);

  const decoded = jwt.decode(refreshToken) as { exp: number };

  await Token.create({
    user_id: userId,
    token: hashed,
    expires_at: new Date(decoded.exp * 1000),
  });
};

export const verifyRefreshToken = async (refreshToken: string) => {
  let payload: any;

  try {
    payload = jwt.verify(refreshToken, REFRESH_SECRET);
  } catch {
    throw Errors.unauthorized("Invalid refresh token");
  }

  const tokens = await Token.findAll({
    where: {
      user_id: payload.userId,
      revoked_at: null,
    },
  });

  for (const t of tokens) {
    const match = await bcrypt.compare(refreshToken, t.token);
    if (match) {
      if (t.expires_at < new Date()) {
        throw Errors.unauthorized("Refresh token expired");
      }
      return payload;
    }
  }

  throw Errors.unauthorized("Refresh token not recognized");
};

export const revokeRefreshToken = async (refreshToken: string) => {
  const tokens = await Token.findAll({
    where: { revoked_at: null },
  });

  for (const t of tokens) {
    const match = await bcrypt.compare(refreshToken, t.token);
    if (match) {
      t.revoked_at = new Date();
      await t.save();
      return;
    }
  }
};
