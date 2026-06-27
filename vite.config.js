import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    // Ép buộc gom các module nhỏ thành file bundle lớn
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        // Đảm bảo đóng gói đầy đủ các thư viện cốt lõi vào bundle thay vì để ở dạng external
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // Đóng gói toàn bộ dependencies của node_modules vào file vendor.js
          }
        },
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    minify: 'terser', // Sử dụng terser để tối ưu hóa code và kiểm tra độ bền vững
    sourcemap: true   // Bật source map để dễ rà soát lỗi
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
