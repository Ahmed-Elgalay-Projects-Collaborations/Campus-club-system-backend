const ApiError = require("../utils/ApiError");

const parseCsvList = (value) =>
  String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const buildCorsOptions = () => {
  const allowedOrigins = new Set(parseCsvList(process.env.CORS_ORIGINS));
  const isProduction = process.env.NODE_ENV === "production";

  return {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.size === 0) {
        callback(null, !isProduction);
        return;
      }

      callback(null, allowedOrigins.has(origin));
    },
  };
};

const applySecurityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
};

const createRateLimiter = () => {
  const max = parsePositiveInteger(process.env.RATE_LIMIT_MAX, 300);
  const windowMs = parsePositiveInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
  const disableRateLimit =
    String(process.env.DISABLE_RATE_LIMIT || "false").toLowerCase() === "true";

  const stateByIp = new Map();

  return (req, res, next) => {
    if (disableRateLimit) {
      next();
      return;
    }

    const now = Date.now();
    const ip =
      req.ip ||
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress ||
      "unknown";
    const existing = stateByIp.get(ip);

    if (stateByIp.size > 10000) {
      for (const [key, value] of stateByIp.entries()) {
        if (value.resetAt <= now) {
          stateByIp.delete(key);
        }
      }
    }

    if (!existing || existing.resetAt <= now) {
      stateByIp.set(ip, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    existing.count += 1;
    if (existing.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfterSeconds));
      next(new ApiError(429, "Too many requests. Please try again later."));
      return;
    }

    next();
  };
};

module.exports = {
  buildCorsOptions,
  applySecurityHeaders,
  createRateLimiter,
};
