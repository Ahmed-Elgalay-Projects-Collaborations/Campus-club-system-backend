const jwt = require("jsonwebtoken");

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable.");
  }
  return secret;
};

const signAccessToken = (payload) =>
  jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const signOtpToken = (payload) =>
  jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_OTP_EXPIRES_IN || "10m",
  });

const verifyAccessToken = (token) => jwt.verify(token, getJwtSecret());
const verifyOtpToken = (token) => jwt.verify(token, getJwtSecret());

module.exports = {
  signAccessToken,
  signOtpToken,
  verifyAccessToken,
  verifyOtpToken,
};
