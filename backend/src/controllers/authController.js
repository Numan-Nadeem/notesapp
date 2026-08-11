import Token from "../model/Token.js";
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
      user: { email: result.user.email, role: result.user.role },
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
        user: { email: user.email, role: user.role },
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
    const { user, accessToken, refreshToken } = await googleAuth({ credential });
    res
      .cookie("accessToken", accessToken, accessCookieOptions)
      .cookie("refreshToken", refreshToken, refreshCookieOptions)
      .json({
        message: "Google login successful",
        user: { email: user.email, name: user.name, role: user.role },
      });
  } catch (error) {
    next(error);
  }
};
