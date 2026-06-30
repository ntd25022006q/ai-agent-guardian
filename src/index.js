/**
 * AI Agent Guardian - Public API
 *
 * Module này expose các hàm thật của Guardian (đã được implement trong
 * scripts/check-integrity.js) dưới dạng API có thể require() như thư viện,
 * thay vì chỉ chạy được qua CLI.
 *
 * HONEST DISCLOSURE
 * -----------------
 * Repo này KHÔNG phải là một secret scanner production-grade như Gitleaks
 * hay TruffleHog. Mục đích thật là:
 *   - Bộ pre-commit hook chạy nội bộ cho AI agent (Cursor/Claude) của tác giả.
 *   - Quét mock data / debugger / hardcoded secrets trong thư mục src/ trước
 *     khi commit, để tránh AI tự sinh code lạc đề.
 *   - Chặn xóa nhầm các thư mục quan trọng (src, config, public, ...).
 *
 * Đối với production secret scanning, hãy dùng Gitleaks/TruffleHog —
 * repo này chỉ có 10 regex rất cơ bản (xem listPatterns()) và không có
 * entropy-based detection, không scan history, không có baseline.
 *
 * API
 * ---
 * - getVersion()                -> đọc version từ package.json
 * - listPatterns()              -> trả về 4 bộ pattern đang dùng
 * - scanString(text)            -> quét 1 chuỗi, trả về object violations
 * - scanFile(filePath)          -> quét 1 file trên đĩa, trả về violations
 * - runIntegrityCheck(options)  -> chạy toàn bộ pipeline (Git/Dep/Source/Build)
 */

const fs = require("fs");
const path = require("path");
const guardian = require("../scripts/check-integrity");

// Đọc version từ package.json (lên 1 cấp từ src/)
const pkgPath = path.resolve(__dirname, "..", "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

/**
 * Trả về version hiện tại của Guardian, lấy từ package.json.
 * @returns {string}
 */
function getVersion() {
  return pkg.version;
}

/**
 * Trả về 4 bộ pattern Guardian đang dùng để quét code:
 *   - protectedDirs: danh sách thư mục không được phép xóa
 *   - mockPatterns: regex phát hiện mock data trong code production
 *   - secretPatterns: regex phát hiện leak API key/password/token
 *   - bannedPackages: danh sách npm package bị cấm trong package.json
 * @returns {{protectedDirs: string[], mockPatterns: RegExp[], secretPatterns: RegExp[], bannedPackages: string[]}}
 */
function listPatterns() {
  return {
    protectedDirs: [...guardian.PROTECTED_DIRS],
    mockPatterns: [...guardian.MOCK_PATTERNS],
    secretPatterns: [...guardian.SECRET_PATTERNS],
    bannedPackages: [...guardian.BANNED_PACKAGES],
  };
}

/**
 * Quét một chuỗi code, trả về các vi phạm tìm thấy.
 * Không gọi process.exit, không in log — thích hợp để dùng programmatic.
 *
 * @param {string} text - Nội dung code cần quét
 * @returns {{mock: Array<{line:number, content:string}>, secret: Array<{line:number}>, debug: Array<{line:number, content:string}>}}
 */
function scanString(text) {
  if (typeof text !== "string") {
    throw new TypeError("scanString() yêu cầu tham số kiểu string");
  }
  const lines = text.split("\n");
  const result = { mock: [], secret: [], debug: [] };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const p of guardian.MOCK_PATTERNS) {
      if (p.test(line)) {
        result.mock.push({ line: i + 1, content: line.trim() });
        break;
      }
    }

    for (const p of guardian.SECRET_PATTERNS) {
      if (p.test(line)) {
        // Che nội dung dòng để tránh leak khi log ra
        result.secret.push({ line: i + 1 });
        break;
      }
    }

    if (/\bdebugger\b/.test(line)) {
      result.debug.push({ line: i + 1, content: line.trim() });
    }
  }
  return result;
}

/**
 * Quét một file trên đĩa. Trả về null nếu file không tồn tại hoặc không phải
 * file code (.js/.ts/.jsx/.tsx). Bỏ qua file .test./.spec.
 *
 * @param {string} filePath - Đường dẫn tuyệt đối hoặc tương đối
 * @returns {({mock: Array, secret: Array, debug: Array} | null)}
 */
function scanFile(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    return null;
  }
  const base = path.basename(abs);
  const isCode = /\.(js|jsx|ts|tsx)$/.test(base);
  const isTest = base.includes(".test.") || base.includes(".spec.");
  if (!isCode || isTest) {
    return null;
  }
  const content = fs.readFileSync(abs, "utf8");
  return scanString(content);
}

/**
 * Chạy pipeline kiểm tra đầy đủ: Git status + Dependency Guard + Source Scan
 * + Build size. Wrapper này gọi trực tiếp các hàm có sẵn trong scripts/check-
 * integrity.js. Lưu ý: các hàm đó có thể process.exit(1) khi phát hiện vi phạm.
 *
 * @param {{src?: string, dist?: string, projectPath?: string}} [options]
 */
function runIntegrityCheck(options = {}) {
  if (options.src) {
    process.env.MOCK_SRC_PATH = options.src;
  }
  if (options.dist) {
    process.env.MOCK_DIST_PATH = options.dist;
  }
  guardian.checkGitStatus();
  guardian.checkDependencyGuard(options.projectPath || "package.json");
  guardian.scanSourceCode(options.src || "src");
  guardian.checkBuildSize(options.dist || "dist");
}

module.exports = {
  getVersion,
  listPatterns,
  scanString,
  scanFile,
  runIntegrityCheck,
};
