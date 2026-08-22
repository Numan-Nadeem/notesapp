import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const authMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied!" });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token!", error });
  }
};
