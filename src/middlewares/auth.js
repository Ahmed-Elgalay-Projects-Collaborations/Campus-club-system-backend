const ApiError = require("../utils/ApiError");
const { verifyAccessToken } = require("../utils/jwt");
const { ROLES, USER_STATUS } = require("../constants/roles");
const logger = require("../utils/logger");
const User = require("../models/user.model");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.security("Missing or malformed bearer token", {
      request: logger.getRequestMeta(req),
    });
    return next(new ApiError(401, "Unauthorized: missing bearer token."));
  }

  const token = authHeader.split(" ")[1];
  let tokenPayload;

  try {
    tokenPayload = verifyAccessToken(token);
  } catch (error) {
    logger.security("Invalid or expired bearer token", {
      request: logger.getRequestMeta(req),
      reason: error.message,
    });
    return next(new ApiError(401, "Unauthorized: invalid or expired token."));
  }

  try {
    const user = await User.findById(tokenPayload.userId)
      .select("_id email displayName role status")
      .lean();

    if (!user) {
      logger.security("Bearer token references non-existing user", {
        request: logger.getRequestMeta(req),
        tokenUserId: tokenPayload.userId,
      });
      return next(new ApiError(401, "Unauthorized: user no longer exists."));
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      status: user.status,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    logger.security("Unauthorized role access attempt without user context", {
      request: logger.getRequestMeta(req),
      requiredRoles: roles,
    });
    return next(new ApiError(401, "Unauthorized."));
  }

  if (!roles.includes(req.user.role)) {
    logger.security("Forbidden role access attempt", {
      request: logger.getRequestMeta(req),
      requiredRoles: roles,
      actualRole: req.user.role,
    });
    return next(new ApiError(403, "Forbidden: insufficient permissions."));
  }

  return next();
};

const requireApprovedUser = (req, res, next) => {
  if (!req.user) {
    logger.security("Unauthorized approved-user access attempt", {
      request: logger.getRequestMeta(req),
    });
    return next(new ApiError(401, "Unauthorized."));
  }

  if (req.user.role === ROLES.ADMIN) {
    return next();
  }

  if (req.user.status !== USER_STATUS.APPROVED) {
    logger.security("Unapproved account attempted member access", {
      request: logger.getRequestMeta(req),
      userStatus: req.user.status,
      role: req.user.role,
    });
    return next(
      new ApiError(
        403,
        "Account is not approved yet. Member features are available only to approved users."
      )
    );
  }

  return next();
};

module.exports = {
  authenticate,
  authorizeRoles,
  requireApprovedUser,
};
