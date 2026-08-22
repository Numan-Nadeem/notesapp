import Token from "../model/Token.js";
import User from "../model/User.js";
import { login, refresh, signup, googleAuth } from "../services/authService.js";
import {
  accessCookieOptions,
  refreshCookieOptions,
  clearCookieOptions,
} from "../config/cookies.js";

export const signupUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await signup({ name, email, password });
    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await login({
      email,
      password,
    });
    res
      .cookie("accessToken", accessToken, accessCookieOptions)
      .cookie("refreshToken", refreshToken, refreshCookieOptions)
      .json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    next(error);
  }
};

// Lets the client verify its cached session against the server and pick up
// profile changes (e.g. role granted in Mongo) instead of trusting localStorage.
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("name email role");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshUser = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken)
      return res.status(401).json({ error: "Refresh token missing!" });

    const { accessToken, refreshToken: newRefresh } = await refresh({
      refreshToken,
    });

    res
      .cookie("accessToken", accessToken, accessCookieOptions)
      .cookie("refreshToken", newRefresh, refreshCookieOptions)
      .json({ message: "Token refreshed" });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) await Token.deleteOne({ token: refreshToken });

    res
      .clearCookie("accessToken", clearCookieOptions)
      .clearCookie("refreshToken", clearCookieOptions)
      .json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const googleAuthUser = async (req, res, next) => {
  try {
    const { credential } = req.body;
    const { user, accessToken, refreshToken } = await googleAuth({
      credential,
    });
    res
      .cookie("accessToken", accessToken, accessCookieOptions)
      .cookie("refreshToken", refreshToken, refreshCookieOptions)
      .json({
        message: "Google login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    next(error);
  }
};
