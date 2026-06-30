/**
 * AI Agent Guardian - Integrity & Safety Checker (World-Class Enforcer)
 * 
 * Script này quét toàn bộ thay đổi Git, cấu trúc dự án và phân tích tĩnh để phát hiện:
 * 1. AI tự ý xóa tệp tin/thư mục quan trọng.
 * 2. Lỗi build rỗng (dung lượng file build quá thấp < 5KB).
 * 3. File sản xuất (production) chứa dữ liệu giả lập (mock data).
 * 4. Rò rỉ thông tin nhạy cảm (Secret Scanner - API Keys, Passwords, Tokens).
 * 5. Cài đặt các thư viện deprecated, không an toàn hoặc bị cấm (Dependency Guard).
 * 6. Code thừa, câu lệnh debug bị bỏ quên (Debug Leak Guard - debugger).
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Danh sách các thư mục quan trọng bị cấm xóa
const PROTECTED_DIRS = ['src', 'config', 'public', 'assets', '.agents', 'scripts'];
const MIN_BUILD_SIZE_KB = 5; // Kích thước tối thiểu cho file build cốt lõi

// 2. Các mẫu Regex phát hiện Mock Data / Hardcoded dữ liệu giả lập trong file production (Case-Sensitive)
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

// 3. Các mẫu Regex quét rò rỉ Secrets (Chuẩn công nghiệp Gitleaks)
const SECRET_PATTERNS = [
  /\b(?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36}\b/,                  // GitHub Tokens
  /\bgithub_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{82}\b/,              // GitHub Fine-grained PAT
  /\bsk-[a-zA-Z0-9]{48}\b/,                                      // OpenAI Classic Key
  /\bsk-proj-[a-zA-Z0-9]{48}\b/,                                 // OpenAI Project Key
  /\bAIza[0-9A-Za-z\-_]{35}\b/,                                  // Google Cloud API Key
  /\bxox[baprs]-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-zA-Z0-9]{32}\b/, // Slack Tokens
  /\b(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}\b/, // AWS Access Key ID
  /\bsk_(?:live|test)_[0-9a-zA-Z]{24}\b/,                        // Stripe API Key
  /password\s*=\s*['"][a-zA-Z0-9_\-!@#$]{6,}['"]/i,             // Hardcoded password
  /api_key\s*=\s*['"][a-zA-Z0-9_\-]{16,}['"]/i                  // Hardcoded generic API Key
];

// 4. Danh sách các thư viện bị cấm hoặc không an toàn (bị cảnh báo bảo mật nghiêm trọng)
const BANNED_PACKAGES = [
  'request',         // Đã bị deprecated, rò rỉ bảo mật
  'node-sass',       // Đã bị deprecated, cài đặt rất hay lỗi build
  'express-jwt',     // Các bản cũ có lỗ hổng bypass xác thực
  'moment',          // Quá nặng, khuyến nghị dùng dayjs hoặc date-fns
  'axios-mock-adapter' // Cấm dùng mock adapter trong code production
];

function checkGitStatus() {
  console.log('🔍 [Guardian] Đang kiểm tra trạng thái Git để phát hiện file bị xóa...');
  try {
    let deletedFilesOutput = '';
    
    if (process.env.MOCK_GIT_STATUS !== undefined) {
      deletedFilesOutput = process.env.MOCK_GIT_STATUS;
      console.log('ℹ️  [Guardian] Sử dụng dữ liệu Git giả lập (Mocking).');
    } else {
      deletedFilesOutput = execSync('git status --porcelain', { encoding: 'utf8' });
    }

    const lines = deletedFilesOutput.split('\n');
    const deletedFiles = [];

    for (const line of lines) {
      if (line.trim() && (line.startsWith(' D') || line.startsWith('D '))) {
        const filePath = line.substring(3).trim();
        deletedFiles.push(filePath);
      }
    }

    if (deletedFiles.length > 0) {
      console.log(`⚠️  [Guardian] Phát hiện các file bị xóa:`, deletedFiles);
      
      const violations = deletedFiles.filter(file => {
        const firstDir = file.split(/[/\\]/)[0];
        return PROTECTED_DIRS.includes(firstDir);
      });

      if (violations.length > 0) {
        console.error(`❌ [LỖI NGHIÊM TRỌNG] AI Agent tự ý xóa các file trong thư mục được bảo vệ:`, violations);
        console.error(`👉 Hãy chạy lệnh 'git restore <file>' để khôi phục lại ngay lập tức.`);
        process.exit(1);
      } else {
        console.log('✅ [Guardian] Không phát hiện file quan trọng nào bị xóa.');
      }
    } else {
      console.log('✅ [Guardian] Không phát hiện file quan trọng nào bị xóa.');
    }
  } catch (error) {
    if (error.message.includes('not a git repository')) {
      console.log('ℹ️  [Guardian] Thư mục hiện tại chưa khởi tạo Git. Bỏ qua kiểm tra Git.');
    } else {
      console.error('❌ [Guardian] Lỗi khi chạy lệnh Git:', error.message);
    }
  }
}

// Kiểm tra dependencies trong package.json (Dependency Guard)
function checkDependencyGuard(projectPath = 'package.json') {
  console.log('🔍 [Guardian] Đang quét dependencies trong package.json...');
  if (!fs.existsSync(projectPath)) {
    console.log('ℹ️  [Guardian] Không tìm thấy package.json. Bỏ qua quét dependencies.');
    return;
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
    const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
    const violations = [];

    for (const pkgName of Object.keys(dependencies)) {
      if (BANNED_PACKAGES.includes(pkgName)) {
        violations.push(pkgName);
      }
    }

    if (violations.length > 0) {
      console.error(`❌ [LỖI NGHIÊM TRỌNG] Phát hiện thư viện bị cấm hoặc không an toàn trong package.json:`, violations);
      console.error(`👉 Yêu cầu AI Agent: Không sử dụng các thư viện đã bị deprecated (như request, node-sass) hoặc thư viện mock trong production.`);
      process.exit(1);
    }
    console.log('✅ [Guardian] Kiểm tra dependencies thành công. Không phát hiện thư viện không an toàn.');
  } catch (error) {
    console.error('❌ [Guardian] Lỗi khi kiểm tra package.json:', error.message);
  }
}

// Quét mã nguồn tĩnh (Mock data, Secrets, Debugger statements)
function scanSourceCode(dirPath = 'src') {
  const targetDir = process.env.MOCK_SRC_PATH || dirPath;
  console.log(`🔍 [Guardian] Đang quét tĩnh thư mục '${targetDir}' chống mock data, rò rỉ key và debugger...`);
  
  if (!fs.existsSync(targetDir)) {
    console.log(`ℹ️  [Guardian] Thư mục '${targetDir}' không tồn tại. Bỏ qua quét mã nguồn.`);
    return;
  }

  const getFiles = (dir) => {
    let results = [];
    if (!fs.existsSync(dir)) {
      return results;
    }
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFiles(file));
      } else {
        if (
          (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.tsx')) &&
          !file.includes('.test.') && !file.includes('.spec.')
        ) {
          results.push(file);
        }
      }
    });
    return results;
  };

  try {
    const files = getFiles(targetDir);
    const mockViolations = [];
    const secretViolations = [];
    const debugViolations = [];

    // Regex nhận diện dòng comment (// ..., /* ..., * ..., <!-- ... -->, # ...)
    // để bỏ qua khi quét debugger — tránh false positive cho từ "debugger"
    // xuất hiện trong JSDoc / comment mô tả tính năng scanner.
    const COMMENT_LINE_REGEX = /^\s*(\/\/|\/\*|\*|<!--|#)/;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isCommentLine = COMMENT_LINE_REGEX.test(line);

        // 1. Quét Mock Data (chỉ quét code, bỏ qua comment)
        if (!isCommentLine) {
          for (const pattern of MOCK_PATTERNS) {
            if (pattern.test(line)) {
              mockViolations.push({ file, line: i + 1, content: line.trim() });
              break;
            }
          }
        }

        // 2. Quét rò rỉ Secret Keys (vẫn quét trong comment vì attacker
        //    có thể giấu key trong comment để bypass review)
        for (const pattern of SECRET_PATTERNS) {
          if (pattern.test(line)) {
            secretViolations.push({ file, line: i + 1, content: '[MÃ HÓA BẢO MẬT KEY]' });
            break;
          }
        }

        // 3. Quét câu lệnh debugger; (chỉ quét code, bỏ qua comment —
        //    nếu không sẽ false positive cho mọi JSDoc nhắc tới từ "debugger")
        if (!isCommentLine && /\bdebugger\b/.test(line)) {
          debugViolations.push({ file, line: i + 1, content: line.trim() });
        }
      }
    }

    let hasErrors = false;

    if (mockViolations.length > 0) {
      console.error(`❌ [LỖI NGHIÊM TRỌNG] Phát hiện AI sử dụng dữ liệu MOCK giả lập trong file production:`);
      mockViolations.forEach(v => {
        console.error(`   📍 File: ${path.relative(process.cwd(), v.file)}:${v.line} -> "${v.content}"`);
      });
      hasErrors = true;
    }

    if (secretViolations.length > 0) {
      console.error(`❌ [LỖI AN NINH NGHIÊM TRỌNG] Phát hiện rò rỉ API Keys / Passwords trong code production:`);
      secretViolations.forEach(v => {
        console.error(`   📍 File: ${path.relative(process.cwd(), v.file)}:${v.line} -> "${v.content}"`);
      });
      console.error(`👉 Yêu cầu AI Agent: Di chuyển tất cả khóa bí mật vào file .env và import bằng process.env!`);
      hasErrors = true;
    }

    if (debugViolations.length > 0) {
      console.error(`❌ [LỖI CHẤT LƯỢNG] Phát hiện câu lệnh 'debugger;' bị bỏ quên trong file production:`);
      debugViolations.forEach(v => {
        console.error(`   📍 File: ${path.relative(process.cwd(), v.file)}:${v.line} -> "${v.content}"`);
      });
      hasErrors = true;
    }

    if (hasErrors) {
      process.exit(1);
    }

    console.log('✅ [Guardian] Quét mã nguồn an toàn. Không phát hiện vi phạm bảo mật hay dữ liệu mock.');
  } catch (error) {
    console.error('❌ [Guardian] Lỗi khi quét mã nguồn:', error.message);
  }
}

function checkBuildSize(distPath) {
  const targetDist = process.env.MOCK_DIST_PATH || distPath || 'dist';
  console.log(`🔍 [Guardian] Đang kiểm tra chất lượng file build trong thư mục '${targetDist}'...`);
  if (!fs.existsSync(targetDist)) {
    console.log(`ℹ️  [Guardian] Thư mục '${targetDist}' không tồn tại. Bỏ qua kiểm tra build.`);
    return;
  }

  const getFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFiles(file));
      } else {
        results.push(file);
      }
    });
    return results;
  };

  try {
    const files = getFiles(targetDist);
    let totalSize = 0;
    
    files.forEach(file => {
      const stats = fs.statSync(file);
      totalSize += stats.size;
    });

    const totalSizeKB = totalSize / 1024;
    console.log(`📦 [Guardian] Tổng dung lượng build: ${totalSizeKB.toFixed(2)} KB (${files.length} tệp tin).`);

    if (totalSizeKB < MIN_BUILD_SIZE_KB && files.length > 0) {
      console.error(`❌ [LỖI NGHIÊM TRỌNG] Gói build quá nhẹ (${totalSizeKB.toFixed(2)} KB).`);
      console.error(`👉 AI Agent có thể đã thiếu các thư viện cốt lõi hoặc viết code mock sơ sài.`);
      process.exit(1);
    }
    console.log('✅ [Guardian] Kiểm tra chất lượng build hoàn tất.');
  } catch (error) {
    console.error('❌ [Guardian] Lỗi khi kiểm tra thư mục build:', error.message);
  }
}

// Export public API để src/index.js có thể import và dùng như thư viện.
// Chỉ chạy CLI khi file được gọi trực tiếp (node scripts/check-integrity.js),
// không chạy khi require() từ file khác.
module.exports = {
  PROTECTED_DIRS,
  MIN_BUILD_SIZE_KB,
  MOCK_PATTERNS,
  SECRET_PATTERNS,
  BANNED_PACKAGES,
  checkGitStatus,
  checkDependencyGuard,
  scanSourceCode,
  checkBuildSize,
};

if (require.main === module) {
  // Chạy các kiểm tra chính
  console.log('==================================================');
  console.log('🛡️  BẮT ĐẦU CHẠY KIỂM TRA TOÀN VẸN AI AGENT GUARDIAN');
  console.log('==================================================');
  checkGitStatus();
  checkDependencyGuard();
  scanSourceCode();
  checkBuildSize();
  console.log('==================================================');
  console.log('✅ HỆ THỐNG AN TOÀN - AI AGENT ĐẠT CHUẨN KỶ LUẬT');
  console.log('==================================================');
  process.exit(0);
}
