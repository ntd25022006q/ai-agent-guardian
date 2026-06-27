<div align="center">

# 🛡️ AI Agent Guardian

**Production-grade enforcer framework for local AI coding agents — with strict file safety, zero-mock-data rules, token compression, and native Git Hooks**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![ESLint](https://img.shields.io/badge/ESLint-8+-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![Jest](https://img.shields.io/badge/Jest-29+-C21325?logo=jest&logoColor=white)](https://jestjs.io/)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## ✨ Features

- **Native Git Hook Enforcer** — Blocks unauthorized deletes and dirty commits natively.
- **Static Mock Scanning** — Blocks mock variables, test arrays, and hardcoded placeholders in production code.
- **95% Token Saver** — Optimizes Aider repo map token footprint and Repomix package layouts.
- **IDE Rules Sync** — Synchronizes strict behavior guidelines directly into Cursor and Claude Code.
- **World-Class Quality Gates** — Pre-configured Vite, Jest, and ESLint configs ensuring bundle completeness.
- **VPN / Proxy Watchdog** — Automatically tests API connection latency to prevent timeout errors.
- **Requirement Spec Guard** — Forces agents to confirm specifications and UI layouts before writing code.

## 🛠️ Tech Stack

| Category   | Technology   |
| ---------- | ------------ |
| Runtime    | Node.js 18+  |
| Testing    | Jest 29+     |
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
| `npm test`            | Runs Jest unit test suites for regex safety       |
| `npm run lint`        | Runs ESLint static syntax & styling analysis      |
| `npm run format`      | Formats code files cleanly using Prettier         |
| `npm run guardian`    | Manually triggers file integrity & mock checks    |
| `npm run monitor`     | Runs latency connection tests for OpenAI/Gemini   |

---

## 🛡️ Quality Gates & Behavior Rules

Every check must PASS or the agent commit is LOCKED.

| Gate | Rule Name          | Enforces                                                      |
| ---- | ------------------ | ------------------------------------------------------------- |
| 1    | NO_DELETING        | Blocks unauthorized deletion of critical assets (`src`, `config`, `.agents`). |
| 2    | ZERO_MOCK_DATA     | Scans and blocks mock data structures in production source files. |
| 3    | TEST_ALLOWANCE     | Allows test files (`.test.js`) to declare mocks freely.       |
| 4    | BUNDLE_INTEGRITY   | Blocks builds smaller than 5KB to prevent empty core package bundles. |
| 5    | CLEAN_SYNTAX       | ESLint zero errors/warnings configuration.                    |
| 6    | REGRESSION_TEST    | Run test suites to guarantee code modifications do not break existing modules. |
| 7    | SPEC_ALIGNMENT     | Enforces AI to outline layout specifications before writing UI code. |
| 8    | API_VERIFICATION   | Forces Web Search/Deep Search instead of hallucinating library API syntax. |
| 9    | VPN_CHECK          | Verify proxy/VPN health to avoid mid-stream prompt connection loss. |

---

## 📁 Project Structure

```
ai-agent-guardian/
├── .agents/
│   ├── AGENTS.md                  # Supreme AI agent behavior constitution
│   └── skills/                    # Specialized agent skill sets
│       ├── code-review/           # Clean Code (SOLID), Big-O optimization
│       ├── security-check/        # Secret leakage, XSS, injection prevention
│       ├── specification-alignment/# UI layouts & requirement verification
│       └── tdd-enforcement/       # Strict test-first cycle enforcer
├── .github/
│   └── workflows/
│       └── ai-guardian.yml        # GitHub Actions CI verification pipeline
├── scripts/
│   ├── check-integrity.js         # Git changes & static mock scanner
│   ├── install-hooks.js           # Native pre-commit hook installer
│   ├── network-monitor.js         # VPN / API server latency test
│   └── test-guardian.js           # 8-scenario integration test suite
├── tests/
│   └── integrity.test.js          # Jest regex matcher validation unit tests
├── .clauderules                   # Claude Code rules sync
├── .cursorrules                   # Cursor rules sync
├── .aider.conf.yml                # Aider token & repo map footprint saver
├── eslint.config.js               # ESLint configuration
├── jest.config.js                 # Jest unit testing configurations
├── mcp-config.json                # Model Context Protocol tools template
├── package.json                   # Script configurations & dev dependencies
├── repomix.config.json            # Repomix token saving exclusions config
└── vite.config.js                 # Vite packaging & bundle configurations
```

## 📄 License

MIT -- Copyright (c) 2026 Nguyen Tien Dat. All rights reserved.
