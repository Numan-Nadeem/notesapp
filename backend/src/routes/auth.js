import express from "express";
import {
  loginUser,
  logoutUser,
  refreshUser,
  signupUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/refresh", refreshUser);
router.post("/logout", logoutUser);

export default router;
