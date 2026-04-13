const mongoose = require("mongoose");
const logger = require("../utils/logger");

const READY_STATE_LABELS = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

let listenersAttached = false;

const getDatabaseHealth = () => {
  const connection = mongoose.connection;
  const readyState = connection.readyState;
  const isConnected = readyState === 1;

  return {
    connected: isConnected,
    readyState,
    state: READY_STATE_LABELS[readyState] || "unknown",
    name: connection.name || null,
    host: connection.host || null,
  };
};

const attachConnectionListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connection established", {
      db: getDatabaseHealth(),
    });
  });

  mongoose.connection.on("disconnected", () => {
    logger.error("MongoDB disconnected", {
      db: getDatabaseHealth(),
    });
  });

  mongoose.connection.on("reconnected", () => {
    logger.info("MongoDB reconnected", {
      db: getDatabaseHealth(),
    });
  });

  mongoose.connection.on("error", (error) => {
    logger.error("MongoDB connection error", {
      db: getDatabaseHealth(),
      reason: error.message,
    });
  });
};

const connectDatabase = async (serviceName, fallbackDbName) => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;

  if (!mongoUri) {
    throw new Error("Missing MONGO_URI or MONGO_URL environment variable.");
  }

  const dbName = process.env.MONGO_DB_NAME || fallbackDbName;

  attachConnectionListeners();
  await mongoose.connect(mongoUri, { dbName });
  logger.info("MongoDB connected", {
    service: serviceName,
    dbName,
    db: getDatabaseHealth(),
  });
};

module.exports = connectDatabase;
module.exports.getDatabaseHealth = getDatabaseHealth;
