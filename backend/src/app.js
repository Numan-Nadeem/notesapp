import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import notesRoutes from "./routes/notes.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import { config } from "./config/env.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.clientOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Everything lives under /api. Vercel's service rewrite forwards /api/* here
// without stripping the prefix, so the mount point has to include it; in dev
// VITE_API_URL points at http://localhost:3000/api for the same reason.
const api = express.Router();

// Liveness probe, deliberately registered before the database gate so it still
// answers when Mongo is unreachable.
api.get("/", (req, res) => res.send("Notsify API is running..."));

// A serverless invocation doesn't inherit a connection from startup, so ensure
// the (cached) connection is live before any handler touches a model.
api.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

api.use("/notes", notesRoutes);
api.use("/auth", authRoutes);
api.use("/admin", adminRoutes);

app.use("/api", api);

app.use(notFound);
app.use(errorHandler);

export default app;
