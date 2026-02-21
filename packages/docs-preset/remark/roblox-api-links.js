const fs = require("fs");

const manifestCache = new Map();

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

function sanitizeModulePath(moduleId) {
  if (!moduleId) {
    return "unnamed";
  }
  const normalized = String(moduleId).replace(/\\/g, "/");
  const segments = normalized.split("/").map((segment) => {
    const trimmed = segment.trim();
    if (!trimmed) {
      return "unnamed";
    }
    return trimmed.replace(/[<>:"|?*]/g, "_");
  });
  return segments.join("/");
}

function stripApiPrefix(value) {
  return value.replace(/^(Class|Datatype|Enum|Global|Library|Classes|Docs)\./, "");
}

function parseTarget(target) {
  const parts = String(target).split("|");
  const rawTarget = parts.shift().trim();
  const label = parts.length > 0 ? parts.join("|").trim() : null;
  return { rawTarget, label };
}

function parseMember(rest) {
  const match = rest.match(/^([A-Za-z0-9_]+)([:\.])(.+)$/);
  let name = rest;
  let member = null;
  if (match) {
    name = match[1];
    member = match[3] || null;
  }
  return { name, member };
}

function cleanMemberName(value) {
  if (!value) {
    return null;
  }
  return String(value).replace(/\(.*\)$/, "");
}

function parseLocalTarget(rest) {
  const raw = String(rest || "").trim();
  if (!raw) {
    return { className: null, categories: [], member: null };
  }
  let classPath = raw;
  let member = null;
  const colonIndex = raw.lastIndexOf(":");
  if (colonIndex !== -1) {
    classPath = raw.slice(0, colonIndex);
    member = raw.slice(colonIndex + 1);
  }
  const segments = classPath.split(".").filter(Boolean);
  if (segments.length === 0) {
    return { className: null, categories: [], member };
  }
  const className = segments.pop();
  return { className, categories: segments, member };
}

function joinUrl(base, ...parts) {
  const tail = parts.filter(Boolean).join("/");
  if (!tail) {
    return base;
  }
  return base.replace(/\/+$/g, "") + "/" + tail.replace(/^\/+/g, "");
}

function loadManifestIndex(options) {
  if (!options || !options.manifestPath) {
    return null;
  }
  const lang = options.referenceLang || "";
  const cacheKey = `${options.manifestPath}::${lang}`;
  if (manifestCache.has(cacheKey)) {
    const cached = manifestCache.get(cacheKey);
    if (cached && cached.mtimeMs !== undefined) {
      try {
        const stat = fs.statSync(options.manifestPath);
        if (stat && stat.mtimeMs === cached.mtimeMs) {
          return cached.index;
        }
      } catch (error) {
        return cached.index || null;
      }
    } else if (cached) {
      return cached;
    }
  }

  let manifest;
  try {
    if (!fs.existsSync(options.manifestPath)) {
      manifestCache.set(cacheKey, null);
      return null;
    }
    manifest = JSON.parse(fs.readFileSync(options.manifestPath, "utf8"));
  } catch (error) {
    manifestCache.set(cacheKey, null);
    return null;
  }

  const outputs = manifest && manifest.outputs ? manifest.outputs : null;
  if (!outputs || typeof outputs !== "object") {
    manifestCache.set(cacheKey, null);
    return null;
  }

  const resolvedLang = (lang && outputs[lang]) ? lang : Object.keys(outputs)[0];
  const list = resolvedLang ? outputs[resolvedLang] : null;
  if (!Array.isArray(list)) {
    manifestCache.set(cacheKey, null);
    return null;
  }

  const index = new Map();
  for (const entry of list) {
    if (typeof entry !== "string") {
      continue;
    }
    if (entry === "index.mdx") {
      continue;
    }
    let trimmed = null;
    if (entry.endsWith("/index.mdx")) {
      trimmed = entry.replace(/\/index\.mdx$/, "");
    } else if (entry.endsWith(".mdx")) {
      trimmed = entry.replace(/\.mdx$/, "");
    } else if (entry.endsWith(".md")) {
      trimmed = entry.replace(/\.md$/, "");
    }
    if (!trimmed) {
      continue;
    }
    if (!trimmed || trimmed === "index") {
      continue;
    }
    const segments = trimmed.split("/");
    const className = segments[segments.length - 1];
    if (!className) {
      continue;
    }
    if (!index.has(className)) {
      index.set(className, []);
    }
    index.get(className).push(trimmed);
  }

  let mtimeMs = null;
  try {
    const stat = fs.statSync(options.manifestPath);
    mtimeMs = stat ? stat.mtimeMs : null;
  } catch (error) {
    mtimeMs = null;
  }

  manifestCache.set(cacheKey, { mtimeMs, index });
  return index;
}

function resolveLocalLink(prefix, rest, options) {
  if (!options || !options.localCategories) {
    return null;
  }
  const entry = options.localCategories[prefix];
  if (!entry || !entry.basePath) {
    return null;
  }

  const { className, categories, member } = parseLocalTarget(rest);
  if (!className) {
    return null;
  }

  const classKey = sanitizeModulePath(className);
  const prefixAlias = entry.categoryPrefix || prefix;
  const prefixSegment = sanitizeModulePath(prefixAlias);
  const categorySegments = categories.map((segment) => sanitizeModulePath(segment)).filter(Boolean);
  const matchSegments = [prefixSegment, ...categorySegments].filter(Boolean);

  let matchedPath = null;
  const manifestIndex = loadManifestIndex(options);
  if (manifestIndex && manifestIndex.has(classKey)) {
    const candidates = manifestIndex.get(classKey);
    const prefixPath = matchSegments.join("/");
    const suffix = "/" + classKey;
    if (prefixPath) {
      matchedPath = candidates.find((candidate) => candidate.startsWith(prefixPath + "/") && candidate.endsWith(suffix));
    }
    if (!matchedPath && candidates.length === 1) {
      matchedPath = candidates[0];
    }
    if (!matchedPath) {
      matchedPath = candidates.find((candidate) => candidate.endsWith(suffix));
    }
  }

  if (!matchedPath) {
    matchedPath = [...matchSegments, classKey].filter(Boolean).join("/");
  }

  let link = joinUrl(entry.basePath, matchedPath);
  if (member) {
    const anchor = sanitizeAnchorId(cleanMemberName(member));
    if (anchor) {
      link += `#${anchor}`;
    }
  }
  return link;
}

function resolveRobloxLink(prefix, rest, options) {
  const base = (options && options.robloxBaseUrl) || "https://create.roblox.com/docs/reference/engine";
  if (!rest) {
    return null;
  }
  if (prefix === "Class") {
    const { name, member } = parseMember(rest);
    if (!name) {
      return null;
    }
    let link = joinUrl(base, "classes", name);
    if (member) {
      const anchor = sanitizeAnchorId(cleanMemberName(member));
      if (anchor) {
        link += `#${anchor}`;
      }
    }
    return link;
  }
  if (prefix === "Datatype") {
    const { name, member } = parseMember(rest);
    if (!name) {
      return null;
    }
    let link = joinUrl(base, "datatypes", name);
    if (member) {
      const anchor = sanitizeAnchorId(cleanMemberName(member));
      if (anchor) {
        link += `#${anchor}`;
      }
    }
    return link;
  }
  if (prefix === "Enum") {
    const { name, member } = parseMember(rest);
    if (!name) {
      return null;
    }
    let link = joinUrl(base, "enums", name);
    if (member) {
      const anchor = sanitizeAnchorId(cleanMemberName(member));
      if (anchor) {
        link += `#${anchor}`;
      }
    }
    return link;
  }
  if (prefix === "Library") {
    const { name, member } = parseMember(rest);
    if (!name) {
      return null;
    }
    let link = joinUrl(base, "libraries", name);
    if (member) {
      const anchor = sanitizeAnchorId(cleanMemberName(member));
      if (anchor) {
        link += `#${anchor}`;
      }
    }
    return link;
  }
  if (prefix === "Global") {
    const { name, member } = parseMember(rest);
    if (!name) {
      return null;
    }
    let link = joinUrl(base, "globals", name);
    if (member) {
      const anchor = sanitizeAnchorId(cleanMemberName(member));
      if (anchor) {
        link += `#${anchor}`;
      }
    }
    return link;
  }
  return null;
}

function resolveApiLink(target, options) {
  if (!target || typeof target !== "string") {
    return null;
  }
  const prefixMatch = target.match(/^([A-Za-z]+)\.(.+)$/);
  if (!prefixMatch) {
    return null;
  }
  const prefix = prefixMatch[1];
  const rest = prefixMatch[2];
  const localLink = resolveLocalLink(prefix, rest, options);
  if (localLink) {
    return localLink;
  }
  return resolveRobloxLink(prefix, rest, options);
}

function transformInlineCode(node, options) {
  const { rawTarget, label } = parseTarget(node.value);
  if (rawTarget === "monospace" && label && label.length > 0) {
    return {
      type: "inlineCode",
      value: label,
    };
  }
  if (label === "no-link") {
    return {
      type: "inlineCode",
      value: rawTarget,
    };
  }
  const link = resolveApiLink(rawTarget, options);
  if (!link) {
    return null;
  }
  const display = label && label.length > 0 ? label : stripApiPrefix(rawTarget);
  return {
    type: "link",
    url: link,
    children: [
      {
        type: "inlineCode",
        value: display || rawTarget,
      },
    ],
  };
}

function visit(node, options) {
  if (!node || typeof node !== "object") {
    return;
  }
  if (Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      if (child && child.type === "inlineCode") {
        const next = transformInlineCode(child, options);
        if (next) {
          node.children[i] = next;
          continue;
        }
      }
      visit(child, options);
    }
  }
}

module.exports = function robloxApiLinks(options = {}) {
  return (tree) => {
    visit(tree, options);
  };
};
