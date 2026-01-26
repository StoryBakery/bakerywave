const path = require("path");
const { spawn } = require("child_process");

const cliPath = require.resolve("@storybakery/bakerywave/bin/bakerywave.js");
const siteDir = path.resolve(__dirname, "..");

function spawnBakerywave(args) {
  return spawn(process.execPath, [cliPath, "--site-dir", siteDir, ...args], {
    stdio: "inherit",
  });
}

const processes = [];
let exiting = false;

function shutdown(exitCode) {
  if (exiting) {
    return;
  }
  exiting = true;

  for (const child of processes) {
    if (child && child.pid && child.exitCode === null) {
      child.kill();
    }
  }

  process.exit(exitCode);
}

const watchProcess = spawnBakerywave(["reference", "watch"]);
const startProcess = spawnBakerywave(["start"]);

processes.push(watchProcess, startProcess);

for (const child of processes) {
  child.on("exit", (code) => {
    if (exiting) {
      return;
    }
    const exitCode = code === null ? 1 : code;
    shutdown(exitCode);
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
