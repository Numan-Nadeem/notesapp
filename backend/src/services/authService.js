import User from "../model/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { configDotenv } from "dotenv";
import Token from "../model/Token.js";

configDotenv();

const ACCESS_JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_JWT_SECRET = process.env.JWT_REFRESH_SECRET;

const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    ACCESS_JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY }
  );

  const refreshToken = jwt.sign({ id: user._id }, REFRESH_JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY,
  });

  const expiryDate = new Date();

  expiryDate.setDate(expiryDate.getDate() + 7);

  await Token.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: expiryDate,
  });

  return { accessToken, refreshToken };
};

export const signup = async ({ name, email, password, role = "user" }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email already in use!");
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long!");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    role,
  });

  await user.save();

  const tokens = await generateTokens(user);

  return { user, tokens };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid email or password!");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Invalid email or password!");

  const { accessToken, refreshToken } = await generateTokens(user);

  return { user, accessToken, refreshToken };
};

export const refresh = async ({ refreshToken, res }) => {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found!" });

    await Token.deleteOne({ token: refreshToken });

    const { accessToken, refreshToken: newRefresh } =
      await generateTokens(user);

    return { accessToken, refreshToken: newRefresh };
  } catch (error) {
    console.error("JWT verify failed:", error.message);
    throw new Error("Invalid or expired refresh token");
  }
};
