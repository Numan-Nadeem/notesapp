import Token from "../model/Token.js";
import { login, refresh, signup } from "../services/authService.js";

export const signupUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await signup({ name, email, password, role });
    res.status(201).json(result);
  } catch (error) {
    res.status(401);
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
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Login successful",
        user: { email: user.email, role: user.role },
      });
  } catch (error) {
    res.status(401);
    next(error);
  }
};

export const refreshUser = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken)
      return res.status(401).json({ message: "Refresh token missing!" });

    const { accessToken, refreshToken: newRefresh } = await refresh({
      refreshToken,
      res,
    });

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", newRefresh, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Token refreshed",
        accessToken,
        refreshToken: newRefresh,
      });
  } catch (error) {
    res.status(403).json({ message: "Token expired or invalid!" });
  }
};

export const logoutUser = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) await Token.deleteOne({ token: refreshToken });

  res
    .clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    })
    .json({ message: "Logged out successfully" });
};
