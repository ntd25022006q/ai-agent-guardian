/**
 * Unit Test Suite for AI Agent Guardian - Regular Expression Checks
 * 
 * Kiểm thử tính chính xác của các Regex phát hiện Mock Data.
 * Đảm bảo các pattern bắt đúng mock data và không báo lỗi oan cho code sạch.
 */

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

describe('🛡️ AI Agent Guardian - Regex Pattern Tests', () => {
  
  test('Phải phát hiện các trường hợp khai báo biến Mock Data (const/let/var)', () => {
    const invalidCodes = [
      'const mockUsers = [];',
      'let myMockResponse = {}',
      'var mockData = require("./mock.json");',
      'const isMockMode = true;',
      'let userMock = "John Doe";'
    ];

    invalidCodes.forEach(code => {
      const isMatched = MOCK_PATTERNS.some(pattern => pattern.test(code));
      expect(isMatched).toBe(true);
    });
  });

  test('Phải phát hiện các biến chứa từ khóa dữ liệu giả lập (dummy, fake, placeholder)', () => {
    const invalidCodes = [
      'const dummyData = { status: 200 };',
      'let fakeData = getFakeUsers();',
      'const tempResponse = "hello";',
      'const placeholderData = fetchPlaceholder();'
    ];

    invalidCodes.forEach(code => {
      const isMatched = MOCK_PATTERNS.some(pattern => pattern.test(code));
      expect(isMatched).toBe(true);
    });
  });

  test('Phải phát hiện mảng dữ liệu test thô (testData)', () => {
    const code = 'const testData = [\n  {\n    id: 1,\n    name: "A"\n  }\n];';
    const isMatched = MOCK_PATTERNS.some(pattern => pattern.test(code));
    expect(isMatched).toBe(true);
  });

  test('Không được báo lỗi oan cho code sạch kết nối API thực tế', () => {
    const cleanCodes = [
      'const userData = await api.getUsers();',
      'const response = await fetch("/api/v1/users");',
      'let currentUserState = null;',
      'const data = await database.query("SELECT * FROM users");',
      'console.log("Success fetching real-time data");'
    ];

    cleanCodes.forEach(code => {
      const isMatched = MOCK_PATTERNS.some(pattern => pattern.test(code));
      expect(isMatched).toBe(false);
    });
  });

});
