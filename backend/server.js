import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { config, validateEnv } from "./src/config/env.js";

validateEnv();

// On Vercel the exported app is invoked per request and must not bind a port.
if (!process.env.VERCEL) {
  connectDB()
    .then(() =>
      app.listen(config.port, () =>
        console.log(`Server running at http://localhost:${config.port}/api`),
      ),
    )
    .catch((error) => {
      console.error("MongoDB connection error!", error);
      // Don't serve against a dead database.
      process.exit(1);
    });
}

export default app;
