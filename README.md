<div align="center">

# 🛡️ AI Agent Guardian

**Bộ pre-commit hook nội bộ cho AI coding agent (Cursor / Claude Code) — quét mock data, leak secret, debugger statement và chặn xóa nhầm thư mục quan trọng trước khi commit.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![ESLint](https://img.shields.io/badge/ESLint-8+-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![Jest](https://img.shields.io/badge/Jest-29+-C21325?logo=jest&logoColor=white)](https://jestjs.io/)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## ⚠️ Honest Disclosure — Repo này thực sự làm gì?

Repo này **KHÔNG phải là secret scanner production-grade** như [Gitleaks](https://github.com/gitleaks/gitleaks) hay [TruffleHog](https://github.com/trufflesecurity/trufflehog). Mục đích thật rất hẹp:

| Việc repo này LÀM được | Việc repo này KHÔNG làm |
| --- | --- |
| Cài pre-commit hook chặn AI tự xóa thư mục `src/`, `config/`, `public/`, `assets/`, `.agents/`, `scripts/` | Không scan Git history (commit cũ) |
| Quét code trong `src/` tìm 9 mẫu mock data (mockData, dummyData, fakeData, ...) | Không có entropy-based secret detection |
| Quét 10 loại secret phổ biến (GitHub PAT, OpenAI `sk-`, AWS AKIA, Stripe `sk_live_`, Google `AIza...`, Slack `xox`, ...) bằng regex | Không scan file binary, không scan env file, không scan commit message |
| Chặn 5 npm package deprecated (`request`, `node-sass`, `express-jwt`, `moment`, `axios-mock-adapter`) | Không có CVE database, không check license |
| Quét câu lệnh `debugger;` bị bỏ quên trong code production | Không quét `console.log` (chỉ warning nhẹ) |
| Kiểm tra dung lượng thư mục `dist/` > 5KB để chặn build rỗng | Không validate bundle structure |
| Test latency tới Gemini / Claude / OpenAI API (script `network-monitor.js`) | Không phải health check production — chỉ kiểm tra có kết nối được không |

**Khuyến nghị:** Nếu bạn cần secret scanning cho production, dùng [Gitleaks](https://github.com/gitleaks/gitleaks) (Go, 200+ pattern, scan history). Repo này chỉ là "lưới an toàn cá nhân" cho 1 developer khi phối tác với AI agent.

## ✨ Features

- **Native Git Hook Enforcer** — Blocks unauthorized deletes and dirty commits natively.
- **Static Mock Scanning** — Blocks mock variables, test arrays, and hardcoded placeholders in production code.
- **IDE Rules Sync** — Synchronizes strict behavior guidelines directly into Cursor and Claude Code.
- **VPN / Proxy Watchdog** — Tests API connection latency to Gemini / Claude / OpenAI.
- **Programmatic API** — `require('ai-agent-guardian')` exposes `getVersion()`, `listPatterns()`, `scanString()`, `scanFile()`, `runIntegrityCheck()` for use as a library.

## 🛠️ Tech Stack

| Category   | Technology   |
| ---------- | ------------ |
| Runtime    | Node.js 18+  |
| Testing    | Jest 30      |
| Linting    | ESLint 8+    |
| Packaging  | Vite 5+      |
| Formatting | Prettier 3   |
| CI/CD      | GitHub Actions|

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 9+

### Installation

```bash
# Clone the repository into your project or templates folder
git clone https://github.com/ntd25022006q/ai-agent-guardian.git
cd ai-agent-guardian

# Install dependencies
npm install

# Install the native Git Hook
node scripts/install-hooks.js
```

### Available Scripts

| Script                | Description                                       |
| --------------------- | ------------------------------------------------- |
| `npm test`            | Runs Jest unit test suites (27 tests, 100% coverage) |
| `npm run lint`        | Runs ESLint static syntax & styling analysis      |
| `npm run format`      | Formats code files cleanly using Prettier         |
| `npm run guardian`    | Manually triggers file integrity & mock checks    |
| `npm run monitor`     | Runs latency connection tests for OpenAI/Gemini/Claude |

### Programmatic API

```js
const guardian = require('ai-agent-guardian');

guardian.getVersion();
// => '1.0.0'

guardian.listPatterns();
// => { protectedDirs: [...], mockPatterns: [...], secretPatterns: [...], bannedPackages: [...] }

guardian.scanString('const mockUsers = [];');
// => { mock: [{ line: 1, content: 'const mockUsers = [];' }], secret: [], debug: [] }

guardian.scanFile('./src/app.js');
// => { mock: [], secret: [], debug: [] } | null (nếu không phải file code)

guardian.runIntegrityCheck({ src: 'src', dist: 'dist' });
// => chạy pipeline Git + Dependency + Source + Build
```

---

## 🛡️ Quality Gates & Behavior Rules

Mỗi check phải PASS hoặc commit bị LOCK bởi pre-commit hook.

| Gate | Rule Name          | Enforces                                                      |
| ---- | ------------------ | ------------------------------------------------------------- |
| 1    | NO_DELETING        | Blocks unauthorized deletion of critical assets (`src`, `config`, `.agents`). |
| 2    | ZERO_MOCK_DATA     | Scans and blocks mock data structures in production source files. |
| 3    | TEST_ALLOWANCE     | Allows test files (`.test.js`) to declare mocks freely.       |
| 4    | BUNDLE_INTEGRITY   | Blocks builds smaller than 5KB to prevent empty core package bundles. |
| 5    | CLEAN_SYNTAX       | ESLint zero errors/warnings configuration.                    |
| 6    | REGRESSION_TEST    | Run test suites to guarantee code modifications do not break existing modules. |
| 7    | SECRET_SCANNER     | 10 regex patterns detect leaked API keys / tokens / passwords. |
| 8    | DEBUGGER_GUARD     | Detect `debugger;` statement left in production code.         |
| 9    | DEPENDENCY_GUARD   | Block deprecated / unsafe npm packages (request, node-sass, ...). |

---

## 📁 Project Structure

```
ai-agent-guardian/
├── src/
│   └── index.js                # Public API: getVersion, listPatterns, scanString, scanFile, runIntegrityCheck
├── scripts/
│   ├── check-integrity.js      # CLI: Git changes + mock/secret/debug scanner + build size + dep guard
│   ├── install-hooks.js        # Native pre-commit hook installer (no Husky dependency)
│   ├── network-monitor.js      # VPN / API latency test (Gemini, Claude, OpenAI)
│   ├── test-guardian.js        # 8-scenario integration test suite
│   ├── gitleaks-benchmark.js   # Benchmark so sánh với Gitleaks
│   ├── stress-test.js          # Performance test trên 10k file
│   └── stress-test-billion.js  # Performance test trên 1M file
├── tests/
│   ├── integrity.test.js       # Jest regex matcher validation (8 tests)
│   └── index.test.js           # Public API tests (19 tests)
├── eslint.config.js            # ESLint configuration
├── jest.config.js              # Jest unit testing configurations
├── mcp-config.json             # Model Context Protocol tools template
├── package.json                # Script configurations & dev dependencies
├── repomix.config.json         # Repomix token saving exclusions config
└── vite.config.js              # Vite packaging & bundle configurations
```

## 📄 License

MIT -- Copyright (c) 2026 Nguyen Tien Dat. All rights reserved.
