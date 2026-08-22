import User from "../model/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Token from "../model/Token.js";
import { badRequest, conflict, unauthorized } from "../utils/ApiError.js";
import { OAuth2Client } from "google-auth-library";
import { config } from "../config/env.js";

const googleClient = new OAuth2Client(config.googleClientId);

const REFRESH_TOKEN_DAYS = 7;

const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiry },
  );

  const refreshToken = jwt.sign({ id: user._id }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiry,
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

  // Google-only accounts have no password set.
  if (!user.password)
    throw unauthorized(
      "This account uses Google Sign-In. Please sign in with Google.",
    );

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
    decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
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

export const googleAuth = async ({ credential }) => {
  if (!credential) throw badRequest("Google credential is required");

  // Verify the ID token with Google's servers.
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.googleClientId,
    });
  } catch {
    throw unauthorized("Invalid Google credential");
  }

  const payload = ticket.getPayload();
  const { sub: googleId, email, name, email_verified } = payload;

  if (!email_verified) {
    throw unauthorized("Google email is not verified");
  }

  // Try to find an existing user by googleId first, then by email.
  let user = await User.findOne({ googleId });

  if (!user) {
    user = await User.findOne({ email });

    if (user) {
      // Link existing email-registered account to Google.
      user.googleId = googleId;
      await user.save();
    } else {
      // Create a brand-new Google user (no password needed).
      user = new User({
        name: name || email.split("@")[0],
        email,
        googleId,
        role: "user",
      });
      await user.save();
    }
  }

  const { accessToken, refreshToken } = await generateTokens(user);
  return { user, accessToken, refreshToken };
};
