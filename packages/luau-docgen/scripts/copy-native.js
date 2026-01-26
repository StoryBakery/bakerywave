#!/usr/bin/env node
/*
luau-docgen 네이티브 바이너리를 native/bin으로 복사하는 스크립트입니다.
Windows GNU 툴체인 런타임 DLL이 필요할 때는 PATH 또는 환경변수로 탐색해 함께 복사합니다.
*/
const fs = require("fs");
const path = require("path");

const WINDOWS_RUNTIME_DLLS = [
  "libstdc++-6.dll",
  "libgcc_s_seh-1.dll",
  "libgcc_s_dw2-1.dll",
  "libwinpthread-1.dll",
];

function parseArgs(argv) {
  const args = {
    profile: process.env.LUAU_DOCGEN_NATIVE_PROFILE || "release",
    source: process.env.LUAU_DOCGEN_NATIVE_SOURCE || null,
    target: process.env.LUAU_DOCGEN_NATIVE_TARGET || null,
    outDir: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--profile" && argv[i + 1]) {
      args.profile = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--source" && argv[i + 1]) {
      args.source = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--target" && argv[i + 1]) {
      args.target = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--out-dir" && argv[i + 1]) {
      args.outDir = argv[i + 1];
      i += 1;
      continue;
    }
  }

  return args;
}

function resolveCandidates(baseDir, profile, target) {
  const ext = process.platform === "win32" ? ".exe" : "";
  const targetDir = path.join(baseDir, "target");
  const candidates = [];

  if (target) {
    candidates.push(path.join(targetDir, target, profile, `luau-docgen${ext}`));
    if (profile !== "release") {
      candidates.push(path.join(targetDir, target, "release", `luau-docgen${ext}`));
    }
    if (profile !== "debug") {
      candidates.push(path.join(targetDir, target, "debug", `luau-docgen${ext}`));
    }
  }

  candidates.push(path.join(targetDir, profile, `luau-docgen${ext}`));
  if (profile !== "release") {
    candidates.push(path.join(targetDir, "release", `luau-docgen${ext}`));
  }
  if (profile !== "debug") {
    candidates.push(path.join(targetDir, "debug", `luau-docgen${ext}`));
  }

  if (fs.existsSync(targetDir)) {
    const targetEntries = fs
      .readdirSync(targetDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((entry) => entry !== "release" && entry !== "debug")
      .sort();

    for (const entry of targetEntries) {
      candidates.push(path.join(targetDir, entry, profile, `luau-docgen${ext}`));
      if (profile !== "release") {
        candidates.push(path.join(targetDir, entry, "release", `luau-docgen${ext}`));
      }
      if (profile !== "debug") {
        candidates.push(path.join(targetDir, entry, "debug", `luau-docgen${ext}`));
      }
    }
  }

  return candidates;
}

function resolveSource(baseDir, args) {
  if (args.source) {
    const sourcePath = path.resolve(args.source);
    return fs.existsSync(sourcePath) ? sourcePath : null;
  }

  const candidates = resolveCandidates(baseDir, args.profile, args.target);
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function splitPathEnv(value) {
  if (!value) {
    return [];
  }

  return value
    .split(path.delimiter)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function countRuntimeMatches(dirPath) {
  const stdcpp = fileExists(path.join(dirPath, "libstdc++-6.dll")) ? 1 : 0;
  if (!stdcpp) {
    return 0;
  }

  const libgcc =
    fileExists(path.join(dirPath, "libgcc_s_seh-1.dll")) ||
    fileExists(path.join(dirPath, "libgcc_s_dw2-1.dll"))
      ? 1
      : 0;
  const winpthread = fileExists(path.join(dirPath, "libwinpthread-1.dll")) ? 1 : 0;

  return stdcpp + libgcc + winpthread;
}

function resolveRuntimeDirFromPath() {
  const pathEntries = splitPathEnv(process.env.PATH);
  let bestEntry = null;
  let bestScore = 0;

  for (const entry of pathEntries) {
    const score = countRuntimeMatches(entry);
    if (score > bestScore) {
      bestEntry = entry;
      bestScore = score;
    }

    if (bestScore === 3) {
      break;
    }
  }

  return bestEntry;
}

function resolveRuntimeDir() {
  const envDir = process.env.LUAU_DOCGEN_RUNTIME_DIR;
  if (envDir) {
    const resolvedEnvDir = path.resolve(envDir);
    if (fileExists(resolvedEnvDir)) {
      return resolvedEnvDir;
    }
  }

  return resolveRuntimeDirFromPath();
}

function copyRuntimeDlls(runtimeDir, outDir) {
  if (!runtimeDir) {
    return { copied: [], missing: WINDOWS_RUNTIME_DLLS.slice() };
  }

  const copied = [];
  const missing = [];

  for (const dllName of WINDOWS_RUNTIME_DLLS) {
    const sourcePath = path.join(runtimeDir, dllName);
    if (!fileExists(sourcePath)) {
      missing.push(dllName);
      continue;
    }

    const targetPath = path.join(outDir, dllName);
    fs.copyFileSync(sourcePath, targetPath);
    copied.push({ dllName, sourcePath, targetPath });
  }

  return { copied, missing, runtimeDir };
}

const args = parseArgs(process.argv.slice(2));
const baseDir = path.resolve(__dirname, "..", "native");
const outDir = args.outDir ? path.resolve(args.outDir) : path.join(baseDir, "bin");
const sourcePath = resolveSource(baseDir, args);

if (!sourcePath) {
  console.error("[luau-docgen] Native binary not found. Build it first.");
  process.exit(1);
}

ensureDir(outDir);
const targetPath = path.join(outDir, path.basename(sourcePath));
fs.copyFileSync(sourcePath, targetPath);
console.log(`[luau-docgen] Copied ${sourcePath} -> ${targetPath}`);

if (process.platform === "win32") {
  const runtimeDir = resolveRuntimeDir();
  const result = copyRuntimeDlls(runtimeDir, outDir);

  if (result.copied.length > 0) {
    for (const entry of result.copied) {
      console.log(`[luau-docgen] Copied runtime DLL ${entry.dllName} -> ${entry.targetPath}`);
    }
  }

  if (!runtimeDir) {
    console.warn(
      "[luau-docgen] Runtime DLL directory not found. Set LUAU_DOCGEN_RUNTIME_DIR or add the runtime directory to PATH."
    );
  } else if (result.missing.length > 0) {
    console.warn(
      `[luau-docgen] Some runtime DLLs were not found in ${runtimeDir}: ${result.missing.join(", ")}`
    );
  }
}
