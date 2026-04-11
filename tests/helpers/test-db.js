const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

const connectTestDatabase = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: "campus_club_test" });
};

const clearTestDatabase = async () => {
  const collections = mongoose.connection.collections;
  const tasks = Object.keys(collections).map((name) =>
    collections[name].deleteMany({})
  );
  await Promise.all(tasks);
};

const disconnectTestDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  } finally {
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }
  }
};

module.exports = {
  connectTestDatabase,
  clearTestDatabase,
  disconnectTestDatabase,
};
