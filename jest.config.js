module.exports = {
  testEnvironment: "node",
  verbose: true,
  // Cấu hình thu thập thông tin bao phủ mã nguồn (code coverage)
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.test.{js,jsx,ts,tsx}",
    "!src/**/*.spec.{js,jsx,ts,tsx}",
  ],
  // Ngưỡng bảo đảm chất lượng kiểm thử tối thiểu (Thành công tối thiểu 80% coverage)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10,
    },
  },
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  setupFilesAfterEnv: [],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/build/"],
};
