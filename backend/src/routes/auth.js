import express from "express";
import {
  loginUser,
  logoutUser,
  refreshUser,
  signupUser,
  googleAuthUser,
} from "../controllers/authController.js";
import { authLimiter } from "../middlewares/rateLimit.js";
import { validateLogin, validateSignup } from "../middlewares/validate.js";

const router = express.Router();

router.post("/signup", authLimiter, validateSignup, signupUser);
router.post("/login", authLimiter, validateLogin, loginUser);
router.post("/google", googleAuthUser);
router.post("/refresh", refreshUser);
router.post("/logout", logoutUser);

export default router;
