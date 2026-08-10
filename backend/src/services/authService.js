import User from "../model/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Token from "../model/Token.js";
import { badRequest, conflict, unauthorized } from "../utils/ApiError.js";

const ACCESS_JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_JWT_SECRET = process.env.JWT_REFRESH_SECRET;

const REFRESH_TOKEN_DAYS = 7;

const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    ACCESS_JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || "15m" }
  );

  const refreshToken = jwt.sign({ id: user._id }, REFRESH_JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
  });

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + REFRESH_TOKEN_DAYS);

  await Token.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: expiryDate,
  });

  return { accessToken, refreshToken };
};

export const signup = async ({ name, email, password }) => {
  if (!name || !email) throw badRequest("Name and email are required!");
  if (!password || password.length < 6) {
    throw badRequest("Password must be at least 6 characters long!");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) throw conflict("Email already in use!");

  const hashedPassword = await bcrypt.hash(password, 10);

  // Role is never taken from client input — always default to "user".
  const user = new User({
    name,
    email,
    password: hashedPassword,
    role: "user",
  });

  await user.save();

  const tokens = await generateTokens(user);

  return { user, tokens };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw unauthorized("Invalid email or password!");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw unauthorized("Invalid email or password!");

  const { accessToken, refreshToken } = await generateTokens(user);

  return { user, accessToken, refreshToken };
};

export const refresh = async ({ refreshToken }) => {
  // Reject tokens we've never issued (or already rotated/revoked).
  const stored = await Token.findOne({ token: refreshToken });
  if (!stored) throw unauthorized("Invalid or expired refresh token");

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, REFRESH_JWT_SECRET);
  } catch {
    // Clean up the unusable token record.
    await Token.deleteOne({ token: refreshToken });
    throw unauthorized("Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    await Token.deleteOne({ token: refreshToken });
    throw unauthorized("User not found");
  }

  // Rotate: invalidate the old refresh token before issuing a new one.
  await Token.deleteOne({ token: refreshToken });

  const { accessToken, refreshToken: newRefresh } = await generateTokens(user);

  return { accessToken, refreshToken: newRefresh };
};
