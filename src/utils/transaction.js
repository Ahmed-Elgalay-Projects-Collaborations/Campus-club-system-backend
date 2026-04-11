const mongoose = require("mongoose");

const isTransactionNotSupportedError = (error) => {
  if (!error || !error.message) {
    return false;
  }

  const message = String(error.message).toLowerCase();
  return (
    message.includes("transaction numbers are only allowed on a replica set") ||
    message.includes("replica set") ||
    message.includes("does not support retryable writes")
  );
};

const runWithTransactionFallback = async (work) => {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(async () => work(session));
  } catch (error) {
    if (isTransactionNotSupportedError(error)) {
      return work(null);
    }
    throw error;
  } finally {
    await session.endSession();
  }
};

module.exports = {
  runWithTransactionFallback,
};
