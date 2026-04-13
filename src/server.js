require("dotenv").config();
const app = require("./app");
const connectDatabase = require("./db/connectDatabase");
const authService = require("./services/auth.service");
const logger = require("./utils/logger");

const PORT = Number(process.env.MONOLITH_PORT || process.env.PORT || 4000);

const start = async () => {
  process.env.MONOLITHIC_MODE = process.env.MONOLITHIC_MODE || "true";
  await connectDatabase(
    "campus-club-monolith",
    process.env.MONOLITH_DB_NAME || process.env.MONGO_DB_NAME || "campus_club"
  );
  await authService.ensureDefaultAdmin();

  app.listen(PORT, () => {
    logger.info("HTTP server started", {
      service: "campus-club-monolith",
      port: PORT,
      nodeEnv: process.env.NODE_ENV || "development",
    });
  });
};

start().catch((error) => {
  logger.error("Service failed to start", {
    service: "campus-club-monolith",
    reason: error.message,
    stack: error.stack,
  });
  process.exit(1);
});
