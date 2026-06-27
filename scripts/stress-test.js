/**
 * AI Agent Guardian - 1000-Case Stress & Fuzz Testing Suite
 * 
 * Script này tự động tạo ra 1000 trường hợp kiểm thử cực khó (500 ca HỢP LỆ phức tạp 
 * và 500 ca VI PHẠM ẩn giấu tinh vi) để kiểm thử độ nhạy và chính xác của Regex Engine.
 */

const MOCK_PATTERNS = [
  /(?:const|let|var)\s+(?:mock|MOCK)\b/,
  /(?:const|let|var)\s+(?:mock|MOCK)[A-Z_0-9]\w*/,
  /(?:const|let|var)\s+\w*(?:Mock|MOCK)\b/,
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
  'request', 'node-sass', 'express-jwt', 'moment', 'axios-mock-adapter'
];

// Hàm kiểm thử xem một dòng code có vi phạm luật không
function evaluateLine(line) {
  const isMock = MOCK_PATTERNS.some(p => p.test(line));
  const isSecret = SECRET_PATTERNS.some(p => p.test(line));
  const isDebugger = /\bdebugger\b/.test(line);
  return { isMock, isSecret, isDebugger, isViolating: isMock || isSecret || isDebugger };
}

// Bộ tạo 1000 ca kiểm thử
function generateTestCases() {
  const cleanCases = [];
  const violatingCases = [];

  // Từ khóa gây nhiễu để test false-positive
  const distractors = ['hammock', 'smock', 'mocktail', 'democracy', 'mockingbird', 'passwords', 'secrets', 'api_keys'];

  for (let i = 1; i <= 500; i++) {
    // 1. Tạo 500 Ca Hợp Lệ (Tricky Clean Cases)
    const dist = distractors[i % distractors.length];
    let cleanLine = '';
    
    switch (i % 5) {
      case 0:
        cleanLine = `const ${dist} = "safe_value_${i}";`; // Biến gây nhiễu
        break;
      case 1:
        cleanLine = `const password = process.env.DB_PASS_${i};`; // Gọi env an toàn
        break;
      case 2:
        cleanLine = `console.log("This is a mock warning message ${i}");`; // Từ khóa mock trong string literal
        break;
      case 3:
        cleanLine = `// TODO: we need to mock this class in tests later ${i}`; // Từ khóa mock trong comment
        break;
      case 4:
        cleanLine = `const apiResponse = await fetch("/api/v1/users/${i}");`; // Gọi API sạch
        break;
    }
    cleanCases.push({ id: `CLEAN_${i}`, code: cleanLine, expected: false });

    // 2. Tạo 500 Ca Vi Phạm (Tricky Violating Cases)
    let violatingLine = '';
    const randomHex = Array.from({ length: 36 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    switch (i % 5) {
      case 0:
        violatingLine = `const mockData = { id: ${i}, value: "bad" };`; // Khai báo mockData trực tiếp
        break;
      case 1:
        violatingLine = `const mySecretApiKey = "ghp_${randomHex}";`; // Rò rỉ GitHub Token
        break;
      case 2:
        violatingLine = `password = "admin_secret_pass_${i}";`; // Rò rỉ Password
        break;
      case 3:
        violatingLine = `  debugger; // Bỏ quên dòng này ở lần sửa thứ ${i}`; // Bỏ quên debugger
        break;
      case 4:
        violatingLine = `const fakeData = getFakeUsers(${i});`; // Khai báo fakeData
        break;
    }
    violatingCases.push({ id: `VIOLATION_${i}`, code: violatingLine, expected: true });
  }

  return { cleanCases, violatingCases };
}

function runStressTest() {
  console.log('==================================================');
  console.log('🚀 KHỞI CHẠY BỘ KIỂM THỬ STRESS TEST 1000 CASES CỰC KHÓ...');
  console.log('==================================================');

  const { cleanCases, violatingCases } = generateTestCases();
  let passedCount = 0;
  let failedCount = 0;

  // 1. Chạy 500 Clean Cases
  cleanCases.forEach(tc => {
    const result = evaluateLine(tc.code);
    if (result.isViolating === tc.expected) {
      passedCount++;
    } else {
      failedCount++;
      console.error(`❌ False Positive [Báo lỗi oan]: ${tc.id}`);
      console.error(`   Mã nguồn: ${tc.code}`);
    }
  });

  // 2. Chạy 500 Violating Cases
  violatingCases.forEach(tc => {
    const result = evaluateLine(tc.code);
    if (result.isViolating === tc.expected) {
      passedCount++;
    } else {
      failedCount++;
      console.error(`❌ False Negative [Bỏ lọt lỗi]: ${tc.id}`);
      console.error(`   Mã nguồn: ${tc.code}`);
    }
  });

  console.log('\n==================================================');
  console.log('📊 KẾT QUẢ CHẠY STRESS TEST THỰC TẾ:');
  console.log(`   - Tổng số ca kiểm thử: 1000`);
  console.log(`   - Số ca thành công (Passed): ${passedCount}/1000`);
  console.log(`   - Số ca thất bại (Failed): ${failedCount}/1000`);
  console.log('==================================================');

  if (failedCount > 0) {
    console.error('❌ Thử nghiệm thất bại! Cần tối ưu lại các Regex Patterns.');
    process.exit(1);
  } else {
    console.log('✅ THÀNH CÔNG RỰC RỠ! Bộ lọc đạt độ chính xác 100% trong 1000 tình huống cực khó.');
    process.exit(0);
  }
}

runStressTest();
