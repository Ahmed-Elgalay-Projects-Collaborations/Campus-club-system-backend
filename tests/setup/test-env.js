process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
process.env.JWT_OTP_EXPIRES_IN = process.env.JWT_OTP_EXPIRES_IN || "10m";
process.env.LOGIN_OTP_TTL_MINUTES = process.env.LOGIN_OTP_TTL_MINUTES || "10";
process.env.API_PUBLIC_BASE_URL =
  process.env.API_PUBLIC_BASE_URL || "http://localhost:4000/api/v1";
process.env.FRONTEND_VERIFY_EMAIL_URL =
  process.env.FRONTEND_VERIFY_EMAIL_URL || "http://localhost:3000/verify-email";
process.env.FRONTEND_RESET_PASSWORD_URL =
  process.env.FRONTEND_RESET_PASSWORD_URL || "http://localhost:3000/reset-password";
process.env.ENABLE_FILE_LOGS = "false";
