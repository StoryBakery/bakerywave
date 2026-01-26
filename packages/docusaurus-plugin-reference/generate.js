const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const KIND_ORDER = [
  "class",
  "interface",
  "type",
  "function",
  "property",
  "field",
  "module",
];

const KIND_LABELS = {
  class: "Classes",
  interface: "Interfaces",
  type: "Types",
  function: "Functions",
  property: "Properties",
  field: "Fields",
  module: "Modules",
};

function resolvePath(siteDir, value, fallback) {
  const target = value || fallback;
  if (!target) {
    return null;
  }
  return path.isAbsolute(target) ? target : path.resolve(siteDir, target);
}

function readJsonFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, "utf8");
  return { data: JSON.parse(raw), raw };
}

function sha1(content) {
  return crypto.createHash("sha1").update(content).digest("hex");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
}

function sanitizeRouteBasePath(value, lang) {
  const base = value || `reference/${lang}`;
  return base.replace(/^\/+|\/+$/g, "");
}

function rewriteLegacyApiLinks(markdown, options) {
  if (!markdown) {
    return markdown;
  }

  const basePath = `/${options.routeBasePath}`;
  return markdown.replace(/\]\(\/api\/([A-Za-z0-9_]+)(#[^)]+)?\)/g, (_, name, hash) => {
    const suffix = hash || "";
    return `](${basePath}/${name}${suffix})`;
  });
}

function normalizeOptions(siteDir, opts) {
  const lang = opts.lang || "luau";
  const input = resolvePath(
    siteDir,
    opts.input,
    path.join(".generated", "reference", `${lang}.json`)
  );
  const outDir = resolvePath(siteDir, opts.outDir, path.join("docs", "reference", lang));
  const manifestPath = resolvePath(
    siteDir,
    opts.manifestPath,
    path.join(".generated", "reference", "manifest.json")
  );
  const routeBasePath = sanitizeRouteBasePath(opts.routeBasePath, lang);

  return {
    lang,
    input,
    outDir,
    manifestPath,
    routeBasePath,
    renderMode: opts.renderMode || "mdx",
    clean: opts.clean !== false,
    includePrivate: opts.includePrivate === true,
  };
}

function loadManifest(manifestPath) {
  if (!manifestPath || !fs.existsSync(manifestPath)) {
    return { outputs: {}, inputs: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    return { outputs: {}, inputs: {} };
  }
}

function saveManifest(manifestPath, manifest) {
  if (!manifestPath) {
    return;
  }
  ensureDir(path.dirname(manifestPath));
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function removeFileIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function cleanStaleFiles(outDir, manifest, nextFiles, lang) {
  const previous = (manifest.outputs && manifest.outputs[lang]) || [];
  const nextSet = new Set(nextFiles);
  for (const file of previous) {
    if (!nextSet.has(file)) {
      removeFileIfExists(path.join(outDir, file));
    }
  }
}

function sortSymbols(symbols) {
  return symbols.slice().sort((left, right) => {
    const leftName = left.qualifiedName || left.name || "";
    const rightName = right.qualifiedName || right.name || "";
    return leftName.localeCompare(rightName);
  });
}

function groupSymbols(symbols) {
  const groups = new Map();
  for (const symbol of symbols) {
    const kind = symbol.kind || "module";
    if (!groups.has(kind)) {
      groups.set(kind, []);
    }
    groups.get(kind).push(symbol);
  }
  for (const [kind, items] of groups.entries()) {
    groups.set(kind, sortSymbols(items));
  }
  return groups;
}

function sanitizeModulePath(moduleId) {
  const normalized = moduleId.replace(/\\/g, "/");
  const segments = normalized.split("/").map((segment) => {
    const trimmed = segment.trim();
    if (!trimmed) {
      return "unnamed";
    }
    return trimmed.replace(/[<>:"|?*]/g, "_");
  });
  return segments.join("/");
}

function sanitizeAnchorId(value) {
  if (!value || typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const collapsed = trimmed.replace(/\s+/g, "-");
  const cleaned = collapsed.replace(/[^A-Za-z0-9_-]/g, "");
  return cleaned || null;
}

function createAnchorId(symbol, headingLabel, usedIds) {
  if (!usedIds) {
    return sanitizeAnchorId(symbol && symbol.name) || sanitizeAnchorId(headingLabel);
  }

  const candidates = [];
  const nameId = sanitizeAnchorId(symbol && symbol.name);
  if (nameId) {
    candidates.push(nameId);
  }

  const qualifiedId = sanitizeAnchorId(symbol && symbol.qualifiedName);
  if (qualifiedId && !candidates.includes(qualifiedId)) {
    candidates.push(qualifiedId);
  }

  const fallbackId = sanitizeAnchorId(headingLabel);
  if (fallbackId && !candidates.includes(fallbackId)) {
    candidates.push(fallbackId);
  }

  if (candidates.length === 0) {
    return null;
  }

  for (const candidate of candidates) {
    if (!usedIds.has(candidate)) {
      usedIds.add(candidate);
      return candidate;
    }
  }

  const base = candidates[0];
  let index = 2;
  let nextId = `${base}-${index}`;
  while (usedIds.has(nextId)) {
    index += 1;
    nextId = `${base}-${index}`;
  }
  usedIds.add(nextId);
  return nextId;
}

function renderSymbol(symbol, options, usedAnchorIds) {
  const headingLabel = symbol.qualifiedName || symbol.name || "Unnamed";
  const anchorId = createAnchorId(symbol, headingLabel, usedAnchorIds);
  const heading = anchorId ? `### ${headingLabel} {#${anchorId}}` : `### ${headingLabel}`;
  const lines = [heading];

  if (symbol.types && symbol.types.display) {
    lines.push("", "```luau", symbol.types.display, "```");
  }

  const descriptionRaw = symbol.docs && symbol.docs.descriptionMarkdown;
  const description = rewriteLegacyApiLinks(descriptionRaw, options);
  const summary = symbol.docs && symbol.docs.summary;
  if (description && description.trim().length > 0) {
    lines.push("", description);
  } else if (summary && summary.trim().length > 0) {
    lines.push("", summary);
  }

  const tags = symbol.docs && Array.isArray(symbol.docs.tags) ? symbol.docs.tags : [];
  if (tags.length > 0) {
    lines.push("", "Tags:");
    for (const tag of tags) {
      const value = tag.value !== undefined ? `: ${tag.value}` : "";
      lines.push(`- ${tag.name}${value}`);
    }
  }

  return lines.join("\n");
}

function renderModulePage(moduleData, options) {
  const lines = [`# ${moduleData.id}`];
  if (moduleData.path) {
    lines.push("", `Source: \`${moduleData.path}\``);
  }

  const symbols = Array.isArray(moduleData.symbols) ? moduleData.symbols : [];
  const filtered = symbols.filter((symbol) => {
    if (symbol.visibility === "ignored") {
      return false;
    }
    if (symbol.visibility === "private" && !options.includePrivate) {
      return false;
    }
    return true;
  });

  const groups = groupSymbols(filtered);
  const usedAnchorIds = new Set();
  for (const kind of KIND_ORDER) {
    const items = groups.get(kind);
    if (!items || items.length === 0) {
      continue;
    }
    lines.push("", `## ${KIND_LABELS[kind] || kind}`);
    for (const symbol of items) {
      lines.push("", renderSymbol(symbol, options, usedAnchorIds));
    }
  }

  return `${lines.join("\n")}\n`;
}

function renderIndexPage(entries) {
  const lines = ["# Reference", "", "## Modules", ""];
  if (entries.length === 0) {
    lines.push("No modules found.");
    return `${lines.join("\n")}\n`;
  }

  for (const entry of entries) {
    const link = entry.relativePath.replace(/\\/g, "/").replace(/\.mdx$/, "");
    lines.push(`- [${entry.id}](${link})`);
  }

  return `${lines.join("\n")}\n`;
}

function buildOutputs(referenceJson, options) {
  const outputs = [];
  const modules = Array.isArray(referenceJson.modules) ? referenceJson.modules : [];

  for (const moduleData of modules) {
    const moduleId = moduleData.id || moduleData.path || "module";
    const relativePath = `${sanitizeModulePath(moduleId)}.mdx`;
    outputs.push({
      id: moduleId,
      relativePath,
      content: renderModulePage({ ...moduleData, id: moduleId }, options),
    });
  }

  const indexEntries = outputs
    .map((item) => ({ id: item.id, relativePath: item.relativePath }))
    .sort((left, right) => left.id.localeCompare(right.id));

  outputs.push({
    id: "index",
    relativePath: "index.mdx",
    content: renderIndexPage(indexEntries),
  });

  return outputs;
}

function generateReferenceDocs(siteDir, opts = {}, providedContent = null) {
  const options = normalizeOptions(siteDir, opts);
  if (options.renderMode !== "mdx") {
    return { written: [], skipped: true };
  }

  const content = providedContent || readJsonFile(options.input);
  if (!content) {
    return { written: [], skipped: true };
  }

  const outputs = buildOutputs(content.data, options);
  const files = outputs.map((item) => item.relativePath);
  const manifest = loadManifest(options.manifestPath);

  if (options.clean) {
    cleanStaleFiles(options.outDir, manifest, files, options.lang);
  }

  for (const output of outputs) {
    writeFile(path.join(options.outDir, output.relativePath), output.content);
  }

  manifest.outputs = manifest.outputs || {};
  manifest.inputs = manifest.inputs || {};
  manifest.outputs[options.lang] = files;
  manifest.inputs[options.lang] = {
    path: options.input,
    hash: sha1(content.raw),
    generatorVersion: content.data.generatorVersion || null,
    generatedAt: new Date().toISOString(),
  };
  saveManifest(options.manifestPath, manifest);

  return {
    written: files,
    manifestPath: options.manifestPath,
    outDir: options.outDir,
    lang: options.lang,
    skipped: false,
  };
}

module.exports = {
  normalizeOptions,
  generateReferenceDocs,
};
