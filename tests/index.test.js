/**
 * Unit Test cho src/index.js
 *
 * Trước đây test này chỉ verify console.log được gọi — không có ý nghĩa gì.
 * Rewrite thành test thật cho 4 API mới:
 *   - getVersion()
 *   - listPatterns()
 *   - scanString(text)
 *   - scanFile(filePath)
 *
 * runIntegrityCheck() không test trực tiếp vì nó gọi process.exit —
 * đã được cover gián tiếp bởi tests/integrity.test.js (test regex)
 * và scripts/test-guardian.js (integration scenario).
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  getVersion,
  listPatterns,
  scanString,
  scanFile,
  runIntegrityCheck,
} = require("../src/index");
const guardian = require("../scripts/check-integrity");

describe("src/index.js — Public API", () => {
  describe("getVersion()", () => {
    test("trả về version khớp với package.json", () => {
      const pkg = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8"),
      );
      expect(getVersion()).toBe(pkg.version);
      expect(typeof getVersion()).toBe("string");
      expect(getVersion().length).toBeGreaterThan(0);
    });
  });

  describe("listPatterns()", () => {
    test("trả về đủ 4 bộ pattern", () => {
      const p = listPatterns();
      expect(Array.isArray(p.protectedDirs)).toBe(true);
      expect(Array.isArray(p.mockPatterns)).toBe(true);
      expect(Array.isArray(p.secretPatterns)).toBe(true);
      expect(Array.isArray(p.bannedPackages)).toBe(true);
    });

    test("protectedDirs chứa src và config", () => {
      const { protectedDirs } = listPatterns();
      expect(protectedDirs).toContain("src");
      expect(protectedDirs).toContain("config");
    });

    test("secretPatterns có ít nhất 8 regex (GitHub, OpenAI, AWS, Stripe, ...)", () => {
      const { secretPatterns } = listPatterns();
      expect(secretPatterns.length).toBeGreaterThanOrEqual(8);
      // Mỗi phần tử phải là RegExp instance
      secretPatterns.forEach((rx) => expect(rx).toBeInstanceOf(RegExp));
    });

    test("bannedPackages chứa request và node-sass (deprecated)", () => {
      const { bannedPackages } = listPatterns();
      expect(bannedPackages).toContain("request");
      expect(bannedPackages).toContain("node-sass");
    });

    test("trả về bản sao — mutate kết quả không ảnh hưởng lần gọi sau", () => {
      const a = listPatterns();
      a.mockPatterns.push(/injected/);
      a.bannedPackages.push("injected-pkg");
      const b = listPatterns();
      expect(b.mockPatterns).not.toContain(/injected/);
      expect(b.bannedPackages).not.toContain("injected-pkg");
    });
  });

  describe("scanString(text)", () => {
    test("phát hiện mock data trong code production", () => {
      const code = "const mockUsers = [];\nlet dummyData = fetch();";
      const result = scanString(code);
      expect(result.mock.length).toBe(2);
      expect(result.mock[0].line).toBe(1);
      expect(result.mock[1].line).toBe(2);
    });

    test("phát hiện leak GitHub token (ghp_...)", () => {
      const code = 'const token = "ghp_' + "a".repeat(36) + '";';
      const result = scanString(code);
      expect(result.secret.length).toBe(1);
      expect(result.secret[0].line).toBe(1);
      // Không trả về content của secret để tránh leak khi log
      expect(result.secret[0]).not.toHaveProperty("content");
    });

    test("phát hiện câu lệnh debugger", () => {
      const code = "function foo() {\n  debugger;\n  return 1;\n}";
      const result = scanString(code);
      expect(result.debug.length).toBe(1);
      expect(result.debug[0].line).toBe(2);
      expect(result.debug[0].content).toContain("debugger");
    });

    test("không báo lỗi cho code sạch dùng process.env", () => {
      const code = [
        "const apiKey = process.env.API_KEY;",
        "const users = await api.getUsers();",
        'let response = await fetch("/api/v1");',
      ].join("\n");
      const result = scanString(code);
      expect(result.mock).toHaveLength(0);
      expect(result.secret).toHaveLength(0);
      expect(result.debug).toHaveLength(0);
    });

    test("ném TypeError khi tham số không phải string", () => {
      expect(() => scanString(null)).toThrow(TypeError);
      expect(() => scanString(undefined)).toThrow(TypeError);
      expect(() => scanString(123)).toThrow(TypeError);
    });
  });

  describe("scanFile(filePath)", () => {
    test("trả về null cho file không tồn tại", () => {
      expect(scanFile("/nonexistent/file.js")).toBeNull();
    });

    test("bỏ qua file .test.js (test files được phép có mock)", () => {
      const tmp = path.join(os.tmpdir(), `guardian-test-${Date.now()}.test.js`);
      fs.writeFileSync(tmp, "const mockUsers = [];\n");
      expect(scanFile(tmp)).toBeNull();
      fs.unlinkSync(tmp);
    });

    test("quét file .js thật và phát hiện vi phạm", () => {
      const tmp = path.join(os.tmpdir(), `guardian-prod-${Date.now()}.js`);
      fs.writeFileSync(
        tmp,
        'const mockData = [];\nconst password = "secret123!";\n',
      );
      const result = scanFile(tmp);
      expect(result).not.toBeNull();
      expect(result.mock.length).toBe(1);
      expect(result.secret.length).toBe(1);
      fs.unlinkSync(tmp);
    });

    test("bỏ qua file không phải code (.md, .json, ...)", () => {
      const tmp = path.join(os.tmpdir(), `guardian-readme-${Date.now()}.md`);
      fs.writeFileSync(tmp, "# Title\n\nconst mockData = [];\n");
      expect(scanFile(tmp)).toBeNull();
      fs.unlinkSync(tmp);
    });
  });

  describe("runIntegrityCheck(options)", () => {
    test("gọi đủ 4 bước pipeline (Git, Dep, Source, Build) theo thứ tự", () => {
      const calls = [];
      const spies = [
        jest
          .spyOn(guardian, "checkGitStatus")
          .mockImplementation(() => calls.push("git")),
        jest
          .spyOn(guardian, "checkDependencyGuard")
          .mockImplementation(() => calls.push("dep")),
        jest
          .spyOn(guardian, "scanSourceCode")
          .mockImplementation(() => calls.push("src")),
        jest
          .spyOn(guardian, "checkBuildSize")
          .mockImplementation(() => calls.push("build")),
      ];
      try {
        runIntegrityCheck();
        expect(calls).toEqual(["git", "dep", "src", "build"]);
      } finally {
        spies.forEach((s) => s.mockRestore());
      }
    });

    test("truyền options.src qua env MOCK_SRC_PATH cho scanSourceCode", () => {
      const spyScan = jest
        .spyOn(guardian, "scanSourceCode")
        .mockImplementation(() => {});
      const spyGit = jest
        .spyOn(guardian, "checkGitStatus")
        .mockImplementation(() => {});
      const spyDep = jest
        .spyOn(guardian, "checkDependencyGuard")
        .mockImplementation(() => {});
      const spyBuild = jest
        .spyOn(guardian, "checkBuildSize")
        .mockImplementation(() => {});
      try {
        delete process.env.MOCK_SRC_PATH;
        runIntegrityCheck({ src: "/custom/src" });
        expect(process.env.MOCK_SRC_PATH).toBe("/custom/src");
        // scanSourceCode đọc process.env.MOCK_SRC_PATH nên tham số 'src' chỉ
        // là default — không bắt buộc phải khớp /custom/src khi env đã được set.
        expect(spyScan).toHaveBeenCalled();
      } finally {
        delete process.env.MOCK_SRC_PATH;
        spyScan.mockRestore();
        spyGit.mockRestore();
        spyDep.mockRestore();
        spyBuild.mockRestore();
      }
    });

    test("truyền options.dist qua env MOCK_DIST_PATH cho checkBuildSize", () => {
      const spyScan = jest
        .spyOn(guardian, "scanSourceCode")
        .mockImplementation(() => {});
      const spyGit = jest
        .spyOn(guardian, "checkGitStatus")
        .mockImplementation(() => {});
      const spyDep = jest
        .spyOn(guardian, "checkDependencyGuard")
        .mockImplementation(() => {});
      const spyBuild = jest
        .spyOn(guardian, "checkBuildSize")
        .mockImplementation(() => {});
      try {
        delete process.env.MOCK_DIST_PATH;
        runIntegrityCheck({ dist: "/custom/dist" });
        expect(process.env.MOCK_DIST_PATH).toBe("/custom/dist");
        expect(spyBuild).toHaveBeenCalled();
      } finally {
        delete process.env.MOCK_DIST_PATH;
        spyScan.mockRestore();
        spyGit.mockRestore();
        spyDep.mockRestore();
        spyBuild.mockRestore();
      }
    });

    test("truyền options.projectPath cho checkDependencyGuard", () => {
      const spyDep = jest
        .spyOn(guardian, "checkDependencyGuard")
        .mockImplementation(() => {});
      const spyGit = jest
        .spyOn(guardian, "checkGitStatus")
        .mockImplementation(() => {});
      const spyScan = jest
        .spyOn(guardian, "scanSourceCode")
        .mockImplementation(() => {});
      const spyBuild = jest
        .spyOn(guardian, "checkBuildSize")
        .mockImplementation(() => {});
      try {
        runIntegrityCheck({ projectPath: "/custom/package.json" });
        expect(spyDep).toHaveBeenCalledWith("/custom/package.json");
      } finally {
        spyDep.mockRestore();
        spyGit.mockRestore();
        spyScan.mockRestore();
        spyBuild.mockRestore();
      }
    });
  });
});
