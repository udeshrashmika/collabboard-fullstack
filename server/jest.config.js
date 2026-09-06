export default {
  testEnvironment: "node",
  transform: {},
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  testTimeout: 60000,
  collectCoverageFrom: [
    "src/**/*.js",
    "models/**/*.js",
    "!src/server.js",
    "!src/config/db.js",
    "!src/utils/email.js",
  ],
  coverageDirectory: "coverage",
};