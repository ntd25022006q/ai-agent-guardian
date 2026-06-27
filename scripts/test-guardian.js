/**
 * Integration Test Suite for AI Agent Guardian (Nâng cao)
 * 
 * Script này tự động chạy giả lập các tình huống từ cơ bản đến phức tạp:
 * 1. Không có lỗi.
 * 2. Xóa file không quan trọng.
 * 3. Xóa file trong thư mục được bảo vệ (Chặn).
 * 4. Build quá nhỏ < 5KB (Chặn).
 * 5. Build chuẩn (Bỏ qua).
 * 6. File production sạch không chứa mock data (Bỏ qua).
 * 7. File production chứa mock data dạng 'const mockData = [...]' (Chặn).
 * 8. File test (.test.js) chứa mock data (Bỏ qua - Vì file test được phép có mock).
 */

const { fork } = require('child_process');
const fs = require('fs');
const path = require('path');

const INTEGRITY_SCRIPT_PATH = path.join(__dirname, 'check-integrity.js');
const TEMP_DIR_SMALL = path.join(__dirname, 'temp_dist_small');
const TEMP_DIR_LARGE = path.join(__dirname, 'temp_dist_large');
const TEMP_SRC_DIR = path.join(__dirname, 'temp_src_folder');

// Helper chạy check-integrity.js
function runIntegrityScript(env) {
  return new Promise((resolve) => {
    const child = fork(INTEGRITY_SCRIPT_PATH, [], {
      env: { ...process.env, ...env },
      silent: true
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

function setupTempFolders() {
  // 1. Tạo thư mục build giả lập
  if (!fs.existsSync(TEMP_DIR_SMALL)) {
    fs.mkdirSync(TEMP_DIR_SMALL);
  }
  fs.writeFileSync(path.join(TEMP_DIR_SMALL, 'bundle.js'), 'a'.repeat(1024)); // 1KB

  if (!fs.existsSync(TEMP_DIR_LARGE)) {
    fs.mkdirSync(TEMP_DIR_LARGE);
  }
  fs.writeFileSync(path.join(TEMP_DIR_LARGE, 'bundle.js'), 'a'.repeat(10 * 1024)); // 10KB

  // 2. Tạo thư mục nguồn src giả lập
  if (!fs.existsSync(TEMP_SRC_DIR)) {
    fs.mkdirSync(TEMP_SRC_DIR);
  }
}

function cleanupTempFolders() {
  try {
    const dirs = [TEMP_DIR_SMALL, TEMP_DIR_LARGE, TEMP_SRC_DIR];
    dirs.forEach(d => {
      if (fs.existsSync(d)) {
        fs.rmSync(d, { recursive: true, force: true });
      }
    });
  } catch (e) {
    // Bỏ qua lỗi dọn dẹp
  }
}

async function runAllTests() {
  console.log('==================================================');
  console.log('🧪 BẮT ĐẦU CHẠY THỬ NGHIỆM PHỨC TẠP AI AGENT GUARDIAN');
  console.log('==================================================');

  let passedCount = 0;
  let failedCount = 0;

  const testCases = [
    {
      name: "Test Case 1: Trạng thái Git sạch, không có file bị xóa",
      setup: () => setupTempFolders(),
      env: { MOCK_GIT_STATUS: "", MOCK_DIST_PATH: "non_existent", MOCK_SRC_PATH: "non_existent" },
      expectedCode: 0,
      assert: (res) => res.stdout.includes('Không phát hiện file quan trọng nào bị xóa')
    },
    {
      name: "Test Case 2: Xóa file ở thư mục test/ (Không được bảo vệ) -> Cho qua",
      setup: () => {},
      env: { MOCK_GIT_STATUS: " D test/mytest.js\n", MOCK_DIST_PATH: "non_existent", MOCK_SRC_PATH: "non_existent" },
      expectedCode: 0,
      assert: (res) => res.stdout.includes('Không phát hiện file quan trọng nào bị xóa')
    },
    {
      name: "Test Case 3: Xóa file trong src/ (Được bảo vệ) -> Phải CHẶN",
      setup: () => {},
      env: { MOCK_GIT_STATUS: " D src/app.js\n", MOCK_DIST_PATH: "non_existent", MOCK_SRC_PATH: "non_existent" },
      expectedCode: 1,
      assert: (res) => res.stderr.includes('LỖI NGHIÊM TRỌNG') && res.stderr.includes('AI Agent tự ý xóa các file trong thư mục được bảo vệ: [ \'src/app.js\' ]')
    },
    {
      name: "Test Case 4: Thư mục build quá nhỏ (< 5KB) -> Phải CHẶN",
      setup: () => {},
      env: { MOCK_GIT_STATUS: "", MOCK_DIST_PATH: TEMP_DIR_SMALL, MOCK_SRC_PATH: "non_existent" },
      expectedCode: 1,
      assert: (res) => res.stderr.includes('LỖI NGHIÊM TRỌNG') && res.stderr.includes('Gói build quá nhẹ')
    },
    {
      name: "Test Case 5: Thư mục build hợp lệ (10KB) -> Cho qua",
      setup: () => {},
      env: { MOCK_GIT_STATUS: "", MOCK_DIST_PATH: TEMP_DIR_LARGE, MOCK_SRC_PATH: "non_existent" },
      expectedCode: 0,
      assert: (res) => res.stdout.includes('Kiểm tra chất lượng build hoàn tất')
    },
    {
      name: "Test Case 6: File production (src/index.js) không chứa mock -> Cho qua",
      setup: () => {
        fs.writeFileSync(path.join(TEMP_SRC_DIR, 'index.js'), 'console.log("Dữ liệu thật kết nối API");');
      },
      env: { MOCK_GIT_STATUS: "", MOCK_DIST_PATH: "non_existent", MOCK_SRC_PATH: TEMP_SRC_DIR },
      expectedCode: 0,
      assert: (res) => res.stdout.includes('Quét mock dữ liệu an toàn. Không có vi phạm.')
    },
    {
      name: "Test Case 7: File production (src/index.js) chứa mock data -> Phải CHẶN",
      setup: () => {
        fs.writeFileSync(
          path.join(TEMP_SRC_DIR, 'index.js'), 
          'const mockData = [{ id: 1, name: "Test User" }];\nconsole.log(mockData);'
        );
      },
      env: { MOCK_GIT_STATUS: "", MOCK_DIST_PATH: "non_existent", MOCK_SRC_PATH: TEMP_SRC_DIR },
      expectedCode: 1,
      assert: (res) => res.stderr.includes('LỖI NGHIÊM TRỌNG') && res.stderr.includes('Phát hiện AI sử dụng dữ liệu MOCK giả lập trong file production')
    },
    {
      name: "Test Case 8: File test (src/index.test.js) chứa mock data -> Cho qua",
      setup: () => {
        // Xóa file cũ
        if (fs.existsSync(path.join(TEMP_SRC_DIR, 'index.js'))) {
          fs.unlinkSync(path.join(TEMP_SRC_DIR, 'index.js'));
        }
        // Tạo file test mới
        fs.writeFileSync(
          path.join(TEMP_SRC_DIR, 'index.test.js'), 
          'const mockData = [{ id: 1, name: "Test User" }];\ndescribe("test", () => {});'
        );
      },
      env: { MOCK_GIT_STATUS: "", MOCK_DIST_PATH: "non_existent", MOCK_SRC_PATH: TEMP_SRC_DIR },
      expectedCode: 0,
      assert: (res) => res.stdout.includes('Quét mock dữ liệu an toàn. Không có vi phạm.')
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    console.log(`\n🏃 Running Test ${i + 1}: ${tc.name}`);
    tc.setup(); // Chạy tiền thiết lập
    const res = await runIntegrityScript(tc.env);

    const codeMatches = res.code === tc.expectedCode;
    const assertMatches = tc.assert(res);

    if (codeMatches && assertMatches) {
      console.log(`👉 Kết quả: ✅ PASSED (Exit code: ${res.code})`);
      passedCount++;
    } else {
      console.error(`👉 Kết quả: ❌ FAILED!`);
      console.error(`   Exit code: ${res.code} (Mong muốn: ${tc.expectedCode})`);
      console.error(`   Output thực tế (Stdout):\n${res.stdout}`);
      console.error(`   Output thực tế (Stderr):\n${res.stderr}`);
      failedCount++;
    }
  }

  cleanupTempFolders();

  console.log('\n==================================================');
  console.log('📊 TỔNG HỢP KẾT QUẢ KIỂM THỬ PHỨC TẠP:');
  console.log(`   - Thành công (Passed): ${passedCount}/${testCases.length}`);
  console.log(`   - Thất bại (Failed): ${failedCount}/${testCases.length}`);
  console.log('==================================================');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests();
