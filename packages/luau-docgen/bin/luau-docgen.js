#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { generate } = require("../src/index.js");
const pkg = require("../package.json");

function parseArgs(argv) {
  const args = {
    rootDir: process.cwd(),
    srcDir: null,
    typesDir: null,
    out: "reference.json",
    failOnWarning: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--root" && argv[i + 1]) {
      args.rootDir = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--src" && argv[i + 1]) {
      args.srcDir = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--types" && argv[i + 1]) {
      args.typesDir = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--out" && argv[i + 1]) {
      args.out = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--fail-on-warning") {
      args.failOnWarning = true;
      continue;
    }

    if (arg === "--legacy") {
      args.legacy = true;
      continue;
    }

    if (arg === "-h" || arg === "--help") {
      args.help = true;
      continue;
    }
  }

  return args;
}

function printHelp() {
  console.log("luau-docgen");
  console.log("\nUsage:");
  console.log("  luau-docgen --out <path> [--root <dir>] [--src <dir>] [--types <dir>]");
  console.log("\nOptions:");
  console.log("  --root <dir>         Root directory (default: cwd)");
  console.log("  --src <dir>          Source directory (default: <root>/src)");
  console.log("  --types <dir>        Optional types directory");
  console.log("  --out <path>         Output JSON path (default: reference.json)");
  console.log("  --fail-on-warning    Exit with non-zero when warnings exist");
  console.log("  --legacy             Use legacy JS parser (no Luau native)");
}

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

function findNativeBinary() {
  const fromEnv = process.env.LUAU_DOCGEN_PATH;
  if (fromEnv && fs.existsSync(fromEnv)) {
    return fromEnv;
  }

  const baseDir = path.resolve(__dirname, "..", "native");
  const candidates = [
    path.join(baseDir, "bin", "luau-docgen"),
    path.join(baseDir, "bin", "luau-docgen.exe"),
    path.join(baseDir, "target", "release", "luau-docgen"),
    path.join(baseDir, "target", "release", "luau-docgen.exe"),
    path.join(baseDir, "target", "debug", "luau-docgen"),
    path.join(baseDir, "target", "debug", "luau-docgen.exe"),
    path.join(baseDir, "build", "luau-docgen"),
    path.join(baseDir, "build", "luau-docgen.exe"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  const targetDir = path.join(baseDir, "target");
  if (fs.existsSync(targetDir)) {
    const targetDirs = fs
      .readdirSync(targetDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    for (const dirName of targetDirs) {
      if (dirName === "release" || dirName === "debug") {
        continue;
      }

      const releaseDir = path.join(targetDir, dirName, "release");
      const debugDir = path.join(targetDir, dirName, "debug");
      const targetCandidates = [
        path.join(releaseDir, "luau-docgen"),
        path.join(releaseDir, "luau-docgen.exe"),
        path.join(debugDir, "luau-docgen"),
        path.join(debugDir, "luau-docgen.exe"),
      ];

      for (const candidate of targetCandidates) {
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }
    }
  }

  if (fs.existsSync(baseDir)) {
    const buildDirs = fs
      .readdirSync(baseDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name.startsWith("build"))
      .map((entry) => entry.name)
      .sort();

    for (const dirName of buildDirs) {
      const buildPath = path.join(baseDir, dirName);
      const buildCandidates = [
        path.join(buildPath, "luau-docgen"),
        path.join(buildPath, "luau-docgen.exe"),
      ];

      for (const candidate of buildCandidates) {
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }
    }
  }

  return null;
}

if (!args.legacy) {
  const nativeBinary = findNativeBinary();
  if (nativeBinary) {
    const nativeArgs = process.argv.slice(2);
    if (!nativeArgs.includes("--generator-version")) {
      nativeArgs.push("--generator-version", pkg.version);
    }

    const result = spawnSync(nativeBinary, nativeArgs, { stdio: "inherit" });
    if (result.error) {
      console.error(`[luau-docgen] failed to run native binary: ${result.error.message}`);
      process.exit(1);
    }
    if (result.status !== null) {
      if (result.status !== 0) {
        console.error(`[luau-docgen] native exited with code ${result.status}`);
        if (process.platform === "win32" && (result.status === -1073741701 || result.status === 3221225595)) {
          console.error("[luau-docgen] Windows runtime load failed (0xC000007B). Make sure the MinGW/MSYS2 runtime DLLs match the binary.");
          console.error("[luau-docgen] Try: set LUAU_DOCGEN_RUNTIME_DIR to the correct runtime bin dir and run: npm --prefix packages/luau-docgen run native:bin");
        }
      }
      process.exit(result.status);
    }
    process.exit(1);
  }

  console.error("[luau-docgen] Native binary not found. Falling back to legacy parser.");
}

const rootDir = path.resolve(args.rootDir);
const srcDir = args.srcDir ? path.resolve(rootDir, args.srcDir) : path.join(rootDir, "src");
const typesDir = args.typesDir ? path.resolve(rootDir, args.typesDir) : null;
const outPath = path.resolve(rootDir, args.out);

const result = generate({
  rootDir,
  srcDir,
  typesDir,
  generatorVersion: pkg.version,
});

const outputDir = path.dirname(outPath);
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(result.data, null, 2));

if (result.diagnostics.length > 0) {
  for (const diagnostic of result.diagnostics) {
    const level = diagnostic.level.toUpperCase();
    console.error(
      `[luau-docgen] ${level} ${diagnostic.file}:${diagnostic.line} ${diagnostic.message}`
    );
  }
}

if (args.failOnWarning && result.diagnostics.length > 0) {
  process.exit(1);
}
