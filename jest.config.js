/* eslint-disable quotes */
/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

module.exports = {
  clearMocks: true,
  moduleFileExtensions: [
    "js",
    // "json",
    "jsx",
    "ts",
    "tsx",
    // "node"
  ],
  roots: [
    "<rootDir>/src",
  ],
  testEnvironment: "node",
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
