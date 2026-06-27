/**
 * AI Agent Guardian - Native Git Hooks Installer
 * 
 * Script này tự động thiết lập hook 'pre-commit' trực tiếp vào thư mục '.git/hooks' 
 * của dự án, đảm bảo hoạt động độc lập không phụ thuộc vào Husky hay các thư viện bên ngoài.
 */

const fs = require('fs');
const path = require('path');

const targetProjectDir = path.resolve(__dirname, '..');
const gitDir = path.join(targetProjectDir, '.git');
const hooksDir = path.join(gitDir, 'hooks');
const preCommitHookPath = path.join(hooksDir, 'pre-commit');

console.log('==================================================');
console.log('🛡️  ĐANG THIẾT LẬP GIT HOOKS BẢO VỆ AI AGENT...');
console.log('==================================================');

// 1. Kiểm tra xem dự án đã khởi tạo Git chưa
if (!fs.existsSync(gitDir)) {
  console.error('❌ LỖI: Không tìm thấy thư mục .git. Dự án chưa được khởi tạo Git.');
  console.error('👉 Hãy chạy lệnh "git init" trước khi cài đặt Git Hooks.');
  process.exit(1);
}

// 2. Tạo thư mục hooks nếu chưa có
if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

// 3. Nội dung của pre-commit hook gọi trực tiếp check-integrity.js
const hookContent = `#!/bin/sh
# AI Agent Guardian - Tự động chạy kiểm tra toàn vẹn và ngăn chặn mã độc/mock data
echo "🛡️ [Guardian] Đang kiểm định chất lượng mã nguồn trước khi commit..."
node scripts/check-integrity.js
if [ $? -ne 0 ]; then
  echo "❌ [Guardian] Commit bị chặn! Hãy sửa lại lỗi AI Agent vi phạm trước khi commit."
  exit 1
fi
`;

try {
  // Ghi đè hoặc tạo mới pre-commit hook
  fs.writeFileSync(preCommitHookPath, hookContent, { encoding: 'utf8', mode: 0o755 });
  console.log(`✅ [THÀNH CÔNG] Đã ghi cấu hình bảo vệ tại: ${path.relative(targetProjectDir, preCommitHookPath)}`);

  // Phân quyền thực thi cho các hệ thống Unix/Linux/macOS (chmod +x)
  try {
    fs.chmodSync(preCommitHookPath, '755');
    console.log('✅ [THÀNH CÔNG] Cấp quyền thực thi thành công cho script Git Hook.');
  } catch (chmodError) {
    // Trên Windows chmodSync có thể không đổi được quyền thực thi dạng file system nhưng Git vẫn chạy được.
    console.log('ℹ️  [Lưu ý] Đang chạy trên Windows hoặc hệ thống không hỗ trợ chmod, quyền thực thi Git mặc định đã được thiết lập.');
  }

  console.log('==================================================');
  console.log('🎉 BỘ KHUNG BẢO VỆ AI AGENT ĐÃ HOẠT ĐỘNG! SẴN SÀNG COMMIT.');
  console.log('==================================================');
} catch (error) {
  console.error('❌ LỖI: Không thể cài đặt Git Hook:', error.message);
  process.exit(1);
}
