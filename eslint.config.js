module.exports = [
  {
    ignores: [
      "dist/*",
      "build/*",
      "node_modules/*",
      "coverage/*"
    ]
  },
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        // Node.js Globals
        process: "readonly",
        __dirname: "readonly",
        module: "readonly",
        require: "readonly",
        console: "readonly",
        exports: "readonly",
        // Jest Globals
        describe: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly"
      }
    },
    rules: {
      // Ép AI Agent tuân thủ chuẩn Clean Code & Type Safety
      "no-unused-vars": "error",          // Cấm khai báo biến rác không sử dụng
      "no-undef": "error",                // Cấm gọi các biến không tồn tại/chưa định nghĩa
      "eqeqeq": ["error", "always"],      // Bắt buộc so sánh === thay vì == để tránh lỗi logic
      "curly": "error",                   // Bắt buộc ngoặc nhọn cho các mệnh đề rẽ nhánh
      "no-implicit-coercion": "error",    // Cấm ép kiểu mờ ám
      "no-eval": "error",                 // Cấm eval vì lý do bảo mật
      "no-var": "error",                  // Cấm sử dụng var, ép dùng const/let
      "prefer-const": "error"             // Ép dùng const nếu biến không thay đổi
    }
  }
];
