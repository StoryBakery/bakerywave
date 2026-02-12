const fs = require("fs");
const path = require("path");

const siteDir = path.resolve(__dirname, "..");
const referenceDir = path.join(siteDir, "docs", "reference", "luau");
const manifestPath = path.join(siteDir, ".generated", "reference", "manifest.json");
const exampleDocPath = path.join(referenceDir, "Showcase", "Examples", "SimpleExample.mdx");

const expectedFiles = [
  path.join(referenceDir, "index.mdx"),
  exampleDocPath,
  manifestPath,
];

let hasError = false;

for (const filePath of expectedFiles) {
  if (!fs.existsSync(filePath)) {
    console.error(`[test] missing generated file: ${filePath}`);
    hasError = true;
  }
}

if (!hasError) {
  const indexContent = fs.readFileSync(path.join(referenceDir, "index.mdx"), "utf8");
  if (!indexContent.includes("# Overview")) {
    console.error("[test] reference index missing overview title.");
    hasError = true;
  }

  const exampleContent = fs.readFileSync(exampleDocPath, "utf8");
  if (!exampleContent.includes("title: SimpleExample")) {
    console.error("[test] SimpleExample reference missing title.");
    hasError = true;
  }
  if (!exampleContent.includes("## Methods")) {
    console.error("[test] SimpleExample reference missing Methods section.");
    hasError = true;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const outputs = manifest.outputs && manifest.outputs.luau;
  if (!Array.isArray(outputs) || !outputs.includes("Showcase/Examples/SimpleExample.mdx")) {
    console.error("[test] manifest missing SimpleExample entry.");
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
}

console.log("[test] generated reference docs verified.");
