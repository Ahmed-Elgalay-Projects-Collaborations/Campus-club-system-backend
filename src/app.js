if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const cors = require("cors");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const {
  buildCorsOptions,
  applySecurityHeaders,
  createRateLimiter,
} = require("./middlewares/security");
const authRoutes = require("./routes/auth.routes");
const eventRoutes = require("./routes/event.routes");
const rsvpRoutes = require("./routes/rsvp.routes");
const announcementRoutes = require("./routes/announcement.routes");
const galleryRoutes = require("./routes/gallery.routes");
const chatRoutes = require("./routes/chat.routes");
const logger = require("./utils/logger");
const { getDatabaseHealth } = require("./db/connectDatabase");

const app = express();

app.use(cors(buildCorsOptions()));
app.use(applySecurityHeaders);
app.use(createRateLimiter());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const startTime = Date.now();
  res.on("finish", () => {
    logger.info("HTTP request completed", {
      request: logger.getRequestMeta(req),
      response: {
        statusCode: res.statusCode,
        durationMs: Date.now() - startTime,
        contentLength: res.getHeader("content-length") || null,
      },
    });
  });
  next();
});

app.get("/health", (req, res) => {
  const db = getDatabaseHealth();
  const isHealthy = db.connected;

  const payload = {
    success: isHealthy,
    status: isHealthy ? "ok" : "degraded",
    service: "campus-club-monolith",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    db,
  };

  res.status(isHealthy ? 200 : 503).json(payload);
});

app.use("/api/v1", authRoutes);
app.use("/api/v1", rsvpRoutes);
app.use("/api/v1", eventRoutes);
app.use("/api/v1", announcementRoutes);
app.use("/api/v1", galleryRoutes);
app.use("/api/v1", chatRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
