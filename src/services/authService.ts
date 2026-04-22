import bcrypt from "bcrypt";
import { User } from "../models/user";
import { Errors } from "../utils/errors";

export const registerUser = async ({
  firstname,
  lastname,
  email,
  password,
}: {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}) => {
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    throw Errors.conflict("Email already in use", "CONFLICT");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstname,
    lastname,
    email,
    password_hash: hashedPassword,
    is_active: true,
  });

  return user;
};

export const loginUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw Errors.unauthorized("Invalid email or password");
  }

  if (!user.is_active) {
    throw Errors.unauthorized("User is inactive");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw Errors.unauthorized("Invalid email or password");
  }

  return user;
};

export const currentUser = async (userId: string) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw Errors.notFound("User not found", "USER_NOT_FOUND");
  }

  return user;
};
