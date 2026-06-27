/**
 * AI Agent Guardian - Network & Proxy Monitor
 * 
 * Script này kiểm tra trạng thái mạng và kết nối tới các đầu API của LLM (Gemini, Claude, OpenAI).
 * Phát hiện ngay lập tức nếu máy bị mất proxy, VPN hoặc VPS.
 */

const https = require('https');

const HOSTS_TO_TEST = [
  { name: 'Gemini API', host: 'generativelanguage.googleapis.com' },
  { name: 'Claude API', host: 'api.anthropic.com' },
  { name: 'OpenAI API', host: 'api.openai.com' }
];

function testConnection(endpoint) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const options = {
      hostname: endpoint.host,
      port: 443,
      path: '/',
      method: 'GET',
      timeout: 5000 // 5 giây timeout
    };

    const req = https.request(options, (res) => {
      res.resume(); // Tiêu thụ stream để giải phóng bộ nhớ
      const duration = Date.now() - startTime;
      resolve({ name: endpoint.name, status: 'CONNECTED', latency: `${duration}ms` });
    });

    req.on('error', (err) => {
      resolve({ name: endpoint.name, status: 'DISCONNECTED', error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ name: endpoint.name, status: 'TIMEOUT', error: 'Kết nối quá hạn (5s)' });
    });

    req.end();
  });
}

async function runMonitor() {
  console.log('==================================================');
  console.log('🌐  ĐANG KIỂM TRA KẾT NỐI MẠNG & PROXY / VPN...');
  console.log('==================================================');

  const results = [];
  for (const host of HOSTS_TO_TEST) {
    process.stdout.write(`Testing connection to ${host.name}... `);
    const res = await testConnection(host);
    if (res.status === 'CONNECTED') {
      console.log(`✅ [OK] (${res.latency})`);
    } else {
      console.log(`❌ [LỖI] - ${res.error}`);
    }
    results.push(res);
  }

  console.log('==================================================');
  const disconnected = results.filter(r => r.status !== 'CONNECTED');
  if (disconnected.length > 0) {
    console.error('⚠️  [CẢNH BÁO] Phát hiện mất kết nối tới một số dịch vụ API AI.');
    console.error('👉 Khuyến nghị: Kiểm tra lại mạng, Proxy VPN hoặc VPS của bạn.');
    console.error('👉 Tránh tiếp tục chat với AI lúc này để hạn chế lỗi nghẽn lệnh.');
    process.exit(1);
  } else {
    console.log('✅ [HOÀN HẢO] Toàn bộ kết nối tới API AI đều thông suốt.');
    process.exit(0);
  }
}

runMonitor();
