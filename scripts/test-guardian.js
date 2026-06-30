/**
 * Integration Test Suite for AI Agent Guardian (World-Class Verification)
 *
 * Script này tự động chạy giả lập các tình huống từ cơ bản đến phức tạp:
 * 1. Không có lỗi.
 * 2. Xóa file không quan trọng.
 * 3. Xóa file trong thư mục được bảo vệ (Chặn).
 * 4. Build quá nhỏ < 5KB (Chặn).
 * 5. Build chuẩn (Bỏ qua).
 * 6. File production sạch không chứa mock (Bỏ qua).
 * 7. File production chứa mock data (Chặn).
 * 8. File test (.test.js) chứa mock data (Bỏ qua).
 * 9. Có dependency bị cấm (request) trong package.json (Chặn).
 * 10. Rò rỉ API Key nhạy cảm trong file production (Chặn).
 * 11. Bỏ quên lệnh debugger; trong file production (Chặn).
 */

const { fork } = require("child_process");
const fs = require("fs");
const path = require("path");

const INTEGRITY_SCRIPT_PATH = path.join(__dirname, "check-integrity.js");
const TEMP_DIR_SMALL = path.join(__dirname, "temp_dist_small");
const TEMP_DIR_LARGE = path.join(__dirname, "temp_dist_large");
const TEMP_SRC_DIR = path.join(__dirname, "temp_src_folder");
const TEMP_PACKAGE_JSON = path.join(__dirname, "temp_package.json");

// Helper chạy check-integrity.js
function runIntegrityScript(env) {
  return new Promise((resolve) => {
    const child = fork(INTEGRITY_SCRIPT_PATH, [], {
      env: { ...process.env, ...env },
      silent: true,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

function setupTempFolders() {
  // 1. Tạo thư mục build giả lập
  if (!fs.existsSync(TEMP_DIR_SMALL)) {
    fs.mkdirSync(TEMP_DIR_SMALL);
  }
  fs.writeFileSync(path.join(TEMP_DIR_SMALL, "bundle.js"), "a".repeat(1024)); // 1KB

  if (!fs.existsSync(TEMP_DIR_LARGE)) {
    fs.mkdirSync(TEMP_DIR_LARGE);
  }
  fs.writeFileSync(
    path.join(TEMP_DIR_LARGE, "bundle.js"),
    "a".repeat(10 * 1024),
  ); // 10KB

  // 2. Tạo thư mục nguồn src giả lập
  if (!fs.existsSync(TEMP_SRC_DIR)) {
    fs.mkdirSync(TEMP_SRC_DIR);
  }
}

function cleanupTempFolders() {
  try {
    const dirs = [TEMP_DIR_SMALL, TEMP_DIR_LARGE, TEMP_SRC_DIR];
    dirs.forEach((d) => {
      if (fs.existsSync(d)) {
        fs.rmSync(d, { recursive: true, force: true });
      }
    });
    if (fs.existsSync(TEMP_PACKAGE_JSON)) {
      fs.unlinkSync(TEMP_PACKAGE_JSON);
    }
  } catch (e) {
    // Bỏ qua lỗi dọn dẹp
  }
}

async function runAllTests() {
  console.log("==================================================");
  console.log("🧪 BẮT ĐẦU CHẠY THỬ NGHIỆM CHI TIẾT AI AGENT GUARDIAN");
  console.log("==================================================");

  let passedCount = 0;
  let failedCount = 0;

  const testCases = [
    {
      name: "Test 1: Trạng thái Git sạch, không có file bị xóa",
      setup: () => setupTempFolders(),
      env: {
        MOCK_GIT_STATUS: "",
        MOCK_DIST_PATH: "non_existent",
        MOCK_SRC_PATH: "non_existent",
      },
      expectedCode: 0,
      assert: (res) =>
        res.stdout.includes("Không phát hiện file quan trọng nào bị xóa"),
    },
    {
      name: "Test 2: Xóa file ở thư mục test/ (Không được bảo vệ) -> Cho qua",
      setup: () => {},
      env: {
        MOCK_GIT_STATUS: " D test/mytest.js\n",
        MOCK_DIST_PATH: "non_existent",
        MOCK_SRC_PATH: "non_existent",
      },
      expectedCode: 0,
      assert: (res) =>
        res.stdout.includes("Không phát hiện file quan trọng nào bị xóa"),
    },
    {
      name: "Test 3: Xóa file trong src/ (Được bảo vệ) -> Phải CHẶN",
      setup: () => {},
      env: {
        MOCK_GIT_STATUS: " D src/app.js\n",
        MOCK_DIST_PATH: "non_existent",
        MOCK_SRC_PATH: "non_existent",
      },
      expectedCode: 1,
      assert: (res) =>
        res.stderr.includes("LỖI NGHIÊM TRỌNG") &&
        res.stderr.includes(
          "AI Agent tự ý xóa các file trong thư mục được bảo vệ",
        ),
    },
    {
      name: "Test 4: Thư mục build quá nhỏ (< 5KB) -> Phải CHẶN",
      setup: () => {},
      env: {
        MOCK_GIT_STATUS: "",
        MOCK_DIST_PATH: TEMP_DIR_SMALL,
        MOCK_SRC_PATH: "non_existent",
      },
      expectedCode: 1,
      assert: (res) =>
        res.stderr.includes("LỖI NGHIÊM TRỌNG") &&
        res.stderr.includes("Gói build quá nhẹ"),
    },
    {
      name: "Test 5: Thư mục build hợp lệ (10KB) -> Cho qua",
      setup: () => {},
      env: {
        MOCK_GIT_STATUS: "",
        MOCK_DIST_PATH: TEMP_DIR_LARGE,
        MOCK_SRC_PATH: "non_existent",
      },
      expectedCode: 0,
      assert: (res) =>
        res.stdout.includes("Kiểm tra chất lượng build hoàn tất"),
    },
    {
      name: "Test 6: File production (src/index.js) không chứa mock/leak -> Cho qua",
      setup: () => {
        fs.writeFileSync(
          path.join(TEMP_SRC_DIR, "index.js"),
          'console.log("Dữ liệu thật kết nối API");',
        );
      },
      env: {
        MOCK_GIT_STATUS: "",
        MOCK_DIST_PATH: "non_existent",
        MOCK_SRC_PATH: TEMP_SRC_DIR,
      },
      expectedCode: 0,
      assert: (res) =>
        res.stdout.includes(
          "Quét mã nguồn an toàn. Không phát hiện vi phạm bảo mật",
        ),
    },
    {
      name: "Test 7: File production (src/index.js) chứa mock data -> Phải CHẶN",
      setup: () => {
        fs.writeFileSync(
          path.join(TEMP_SRC_DIR, "index.js"),
          'const mockData = [{ id: 1, name: "Test User" }];\nconsole.log(mockData);',
        );
      },
      env: {
        MOCK_GIT_STATUS: "",
        MOCK_DIST_PATH: "non_existent",
        MOCK_SRC_PATH: TEMP_SRC_DIR,
      },
      expectedCode: 1,
      assert: (res) =>
        res.stderr.includes("LỖI NGHIÊM TRỌNG") &&
        res.stderr.includes("Phát hiện AI sử dụng dữ liệu MOCK giả lập"),
    },
    {
      name: "Test 8: File test (src/index.test.js) chứa mock data -> Cho qua",
      setup: () => {
        if (fs.existsSync(path.join(TEMP_SRC_DIR, "index.js"))) {
          fs.unlinkSync(path.join(TEMP_SRC_DIR, "index.js"));
        }
        fs.writeFileSync(
          path.join(TEMP_SRC_DIR, "index.test.js"),
          'const mockData = [{ id: 1, name: "Test User" }];\ndescribe("test", () => {});',
        );
      },
      env: {
        MOCK_GIT_STATUS: "",
        MOCK_DIST_PATH: "non_existent",
        MOCK_SRC_PATH: TEMP_SRC_DIR,
      },
      expectedCode: 0,
      assert: (res) =>
        res.stdout.includes(
          "Quét mã nguồn an toàn. Không phát hiện vi phạm bảo mật",
        ),
    },
    {
      name: "Test 9: Rò rỉ API Key nhạy cảm trong production -> Phải CHẶN",
      setup: () => {
        if (fs.existsSync(path.join(TEMP_SRC_DIR, "index.test.js"))) {
          fs.unlinkSync(path.join(TEMP_SRC_DIR, "index.test.js"));
        }
        fs.writeFileSync(
          path.join(TEMP_SRC_DIR, "index.js"),
          'const apiKey = "sk-proj-123456789012345678901234567890123456789012345678";',
        );
      },
      env: {
        MOCK_GIT_STATUS: "",
        MOCK_DIST_PATH: "non_existent",
        MOCK_SRC_PATH: TEMP_SRC_DIR,
      },
      expectedCode: 1,
      assert: (res) =>
        res.stderr.includes("LỖI AN NINH NGHIÊM TRỌNG") &&
        res.stderr.includes("Phát hiện rò rỉ API Keys / Passwords"),
    },
    {
      name: "Test 10: Bỏ quên debugger; trong production -> Phải CHẶN",
      setup: () => {
        fs.writeFileSync(
          path.join(TEMP_SRC_DIR, "index.js"),
          "function test() {\n  debugger;\n  return true;\n}",
        );
      },
      env: {
        MOCK_GIT_STATUS: "",
        MOCK_DIST_PATH: "non_existent",
        MOCK_SRC_PATH: TEMP_SRC_DIR,
      },
      expectedCode: 1,
      assert: (res) =>
        res.stderr.includes("LỖI CHẤT LƯỢNG") &&
        res.stderr.includes("Phát hiện câu lệnh 'debugger;' bị bỏ quên"),
    },
  ];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    console.log(`\n🏃 Running Test ${i + 1}: ${tc.name}`);
    tc.setup();
    const res = await runIntegrityScript(tc.env);

    const codeMatches = res.code === tc.expectedCode;
    const assertMatches = tc.assert(res);

    if (codeMatches && assertMatches) {
      console.log(`👉 Kết quả: ✅ PASSED (Exit code: ${res.code})`);
      passedCount++;
    } else {
      console.error(`👉 Kết quả: ❌ FAILED!`);
      console.error(
        `   Exit code: ${res.code} (Mong muốn: ${tc.expectedCode})`,
      );
      console.error(`   Output thực tế (Stdout):\n${res.stdout}`);
      console.error(`   Output thực tế (Stderr):\n${res.stderr}`);
      failedCount++;
    }
  }

  cleanupTempFolders();

  console.log("\n==================================================");
  console.log("📊 TỔNG HỢP KẾT QUẢ KIỂM THỬ GUARDIAN:");
  console.log(`   - Thành công (Passed): ${passedCount}/${testCases.length}`);
  console.log(`   - Thất bại (Failed): ${failedCount}/${testCases.length}`);
  console.log("==================================================");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests();
