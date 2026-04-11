module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  setupFiles: ["<rootDir>/tests/setup/test-env.js"],
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 30000,
};
