import express from "express";
import notesRoutes from "./src/routes/notes.js";
import authRoutes from "./src/routes/auth.js";
import adminRoutes from "./src/routes/admin.js";
import { connectDB } from "./src/config/db.js";
import { errorHandler, notFound } from "./src/middlewares/errorMiddleware.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

dotenv.configDotenv();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => res.send("Notes API is running..."));

app.use("/notes", notesRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
  );
});
