/**
 * Unit Test Suite for AI Agent Guardian - Regex & Package Security
 * 
 * Kiểm thử tính chính xác của các Regex phát hiện Mock Data, rò rỉ Secrets, 
 * câu lệnh Debugger và danh sách dependencies bị cấm.
 */

// Nạp lại các pattern chính thức từ check-integrity.js
const MOCK_PATTERNS = [
  /const\s+\w*mock\w*\s*=/i,
  /let\s+\w*mock\w*\s*=/i,
  /var\s+\w*mock\w*\s*=/i,
  /mockData\s*=/i,
  /dummyData\s*=/i,
  /tempResponse\s*=/i,
  /placeholderData\s*=/i,
  /fakeData\s*=/i,
  /testData\s*=\s*\[\s*\{/i
];

const SECRET_PATTERNS = [
  /ghp_[a-zA-Z0-9]{36}/,
  /sk-proj-[a-zA-Z0-9]{48}/,
  /AIzaSy[a-zA-Z0-9_\-]{33}/,
  /xoxb-[a-zA-Z0-9\-]{30,}/,
  /amzn\.mws\.[a-zA-Z0-9\-]{30,}/,
  /password\s*=\s*['"][a-zA-Z0-9_\-!@#$]{6,}['"]/i,
  /api_key\s*=\s*['"][a-zA-Z0-9_\-]{16,}['"]/i
];

const BANNED_PACKAGES = [
  'request',
  'node-sass',
  'express-jwt',
  'moment',
  'axios-mock-adapter'
];

describe('🛡️ AI Agent Guardian - World-Class Security & Rules Verification', () => {

  describe('1. Mock Data Scanner', () => {
    test('Phải phát hiện biến Mock Data và test arrays', () => {
      const invalid = [
        'const mockUsers = [];',
        'let dummyData = fetchDummy();',
        'const tempResponse = {}'
      ];
      invalid.forEach(code => {
        expect(MOCK_PATTERNS.some(p => p.test(code))).toBe(true);
      });
    });

    test('Không được báo lỗi cho code thật kết nối API', () => {
      const clean = [
        'const users = await api.getUsers();',
        'let response = await fetch("/api/v1");'
      ];
      clean.forEach(code => {
        expect(MOCK_PATTERNS.some(p => p.test(code))).toBe(false);
      });
    });
  });

  describe('2. Secret Keys Leakage Scanner', () => {
    test('Phải chặn đứng các chuỗi rò rỉ API Keys / Tokens', () => {
      const leaks = [
        'const apiKey = "sk-proj-123456789012345678901234567890123456789012345678";',
        'let token = "ghp_123456789012345678901234567890123456";',
        'const password = "mySecretPassword123!";',
        'const api_key = "abcdefghijklmnop";'
      ];
      leaks.forEach(code => {
        expect(SECRET_PATTERNS.some(p => p.test(code))).toBe(true);
      });
    });

    test('Không được chặn biến môi trường an toàn', () => {
      const clean = [
        'const apiKey = process.env.API_KEY;',
        'const dbPassword = process.env.DB_PASSWORD;',
        'const token = process.env.GITHUB_TOKEN;'
      ];
      clean.forEach(code => {
        expect(SECRET_PATTERNS.some(p => p.test(code))).toBe(false);
      });
    });
  });

  describe('3. Debug Leak Scanner', () => {
    test('Phải phát hiện câu lệnh debugger;', () => {
      const code = '  debugger; // Tạm dừng debug';
      expect(/\bdebugger\b/.test(code)).toBe(true);
    });

    test('Không được chặn hàm log hoặc tên hàm chứa chữ debug', () => {
      const clean = [
        'console.log("debug mode is active");',
        'function debugLogger() {}',
        'const isDebugging = true;'
      ];
      clean.forEach(code => {
        expect(/\bdebugger\b/.test(code)).toBe(false);
      });
    });
  });

  describe('4. Banned Dependency Guard', () => {
    test('Phải phát hiện package bị cấm trong dependencies', () => {
      const mockPkg = {
        dependencies: {
          "express": "^4.18.2",
          "request": "^2.88.2" // Bị cấm
        }
      };
      
      const hasBanned = Object.keys(mockPkg.dependencies).some(dep => BANNED_PACKAGES.includes(dep));
      expect(hasBanned).toBe(true);
    });

    test('Cho phép các package an toàn thông thường', () => {
      const mockPkg = {
        dependencies: {
          "express": "^4.18.2",
          "dayjs": "^1.11.10",
          "axios": "^1.6.0"
        }
      };
      
      const hasBanned = Object.keys(mockPkg.dependencies).some(dep => BANNED_PACKAGES.includes(dep));
      expect(hasBanned).toBe(false);
    });
  });

});
