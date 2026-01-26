const fs = require("fs");
const path = require("path");

const siteDir = path.resolve(__dirname, "..");
const referenceDir = path.join(siteDir, "docs", "reference", "luau");
const manifestPath = path.join(siteDir, ".generated", "reference", "manifest.json");

const expectedFiles = [
  path.join(referenceDir, "index.mdx"),
  path.join(referenceDir, "Example.mdx"),
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
  if (!indexContent.includes("# Reference")) {
    console.error("[test] reference index missing title.");
    hasError = true;
  }

  const exampleContent = fs.readFileSync(path.join(referenceDir, "Example.mdx"), "utf8");
  if (!exampleContent.includes("# Example")) {
    console.error("[test] Example reference missing title.");
    hasError = true;
  }
  if (!exampleContent.includes("## Functions")) {
    console.error("[test] Example reference missing Functions section.");
    hasError = true;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const outputs = manifest.outputs && manifest.outputs.luau;
  if (!Array.isArray(outputs) || !outputs.includes("Example.mdx")) {
    console.error("[test] manifest missing Example.mdx entry.");
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
}

console.log("[test] generated reference docs verified.");
