require("dotenv").config();
const app = require("./app");
const connectDatabase = require("./db/connectDatabase");
const authService = require("./services/auth.service");

const PORT = Number(process.env.MONOLITH_PORT || process.env.PORT || 4000);

const start = async () => {
  process.env.MONOLITHIC_MODE = process.env.MONOLITHIC_MODE || "true";
  await connectDatabase(
    "campus-club-monolith",
    process.env.MONOLITH_DB_NAME || process.env.MONGO_DB_NAME || "campus_club"
  );
  await authService.ensureDefaultAdmin();

  app.listen(PORT, () => {
    console.log(`[campus-club-monolith] running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error("[campus-club-monolith] failed to start:", error.message);
  process.exit(1);
});
