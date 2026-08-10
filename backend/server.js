import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import notesRoutes from "./src/routes/notes.js";
import authRoutes from "./src/routes/auth.js";
import adminRoutes from "./src/routes/admin.js";
import { connectDB } from "./src/config/db.js";
import { errorHandler, notFound } from "./src/middlewares/errorMiddleware.js";
import { config, validateEnv } from "./src/config/env.js";

validateEnv();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.clientOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.send("Notsify API is running..."));

app.use("/notes", notesRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(config.port, () =>
    console.log(`Server running at http://localhost:${config.port}`)
  );
});

export default app;
