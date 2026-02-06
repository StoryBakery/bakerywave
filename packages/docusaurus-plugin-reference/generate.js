const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execSync, spawnSync } = require("child_process");

const SECTION_ORDER = [
    "type",
    "interface",
    "constructor",
    "property",
    "method",
    "function",
    "event",
];

const KIND_LABELS = {
    type: "Types",
    interface: "Interfaces",
    constructor: "Constructors",
    property: "Properties",
    method: "Methods",
    function: "Functions",
    event: "Events",
};

function escapeHtml(text) {
    if (!text) return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/{/g, "&#123;")
        .replace(/}/g, "&#125;");
}

function splitTypeDisplay(display) {
    if (!display || typeof display !== "string") {
        return { typeDisplay: display, extraDescription: null };
    }
    const lines = display.split(/\r?\n/);
    const firstLine = lines[0] || "";
    const separator = " -- ";
    const index = firstLine.indexOf(separator);
    if (index === -1) {
        return { typeDisplay: display, extraDescription: null };
    }
    const typePart = firstLine.slice(0, index).trim();
    const descPart = firstLine.slice(index + separator.length).trim();
    const rest = lines.slice(1);
    const merged = [typePart, ...rest].filter(Boolean).join("\n").trim();
    return {
        typeDisplay: merged || typePart,
        extraDescription: descPart || null,
    };
}

function buildFallbackSignature(symbol) {
    if (!symbol) {
        return null;
    }
    const kind = symbol.kind;
    if (kind !== "function" && kind !== "method" && kind !== "constructor" && kind !== "callback") {
        return null;
    }
    const qualified = symbol.qualifiedName || symbol.name;
    if (!qualified) {
        return null;
    }
    return `${qualified}()`;
}

function resolveTypeDisplay(symbol) {
    if (!symbol) {
        return { typeDisplay: null, extraDescription: null };
    }
    const raw = symbol.types && symbol.types.display;
    const typeInfo = splitTypeDisplay(raw);
    if (typeInfo.typeDisplay) {
        return typeInfo;
    }
    const fallback = buildFallbackSignature(symbol);
    if (fallback) {
        return { typeDisplay: fallback, extraDescription: typeInfo.extraDescription };
    }
    return typeInfo;
}

function resolvePath(siteDir, value, fallback) {
    const target = value || fallback;
    if (!target) {
        return null;
    }
    return path.isAbsolute(target) ? target : path.resolve(siteDir, target);
}


function findGitRoot(startDir) {
    let current = startDir;
    while (current && current !== path.dirname(current)) {
        if (fs.existsSync(path.join(current, ".git"))) {
            return current;
        }
        current = path.dirname(current);
    }
    return null;
}


function normalizeRepoUrl(remoteUrl) {
    if (!remoteUrl) {
        return null;
    }
    let url = remoteUrl.trim();
    if (url.endsWith(".git")) {
        url = url.slice(0, -4);
    }
    if (url.startsWith("git@")) {
        const parts = url.replace("git@", "").split(":");
        const hostPart = parts[0];
        const pathPart = parts.slice(1).join(":");
        if (hostPart && pathPart) {
            return "https://" + hostPart + "/" + pathPart;
        }
    }
    return url;
}

function detectDefaultSource(siteDir) {
    try {
        const gitRoot = findGitRoot(siteDir);
        if (!gitRoot) {
            return null;
        }
        const remote = execSync("git config --get remote.origin.url", { cwd: gitRoot, stdio: ["ignore", "pipe", "ignore"] })
            .toString()
            .trim();
        if (!remote) {
            return null;
        }
        const repoUrl = normalizeRepoUrl(remote);
        if (!repoUrl) {
            return null;
        }
        return {
            repoUrl,
            branch: "main",
            basePath: "",
            stripPrefix: "",
        };
    } catch (error) {
        return null;
    }
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

function applyDefaultFenceLanguage(markdown, defaultLang) {
    if (!markdown) {
        return markdown;
    }

    const lines = markdown.split(/\r?\n/);
    const output = [];
    let inFence = false;
    const language = defaultLang || "luau";

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("```")) {
            const fenceLang = trimmed.slice(3).trim();
            if (!inFence) {
                if (!fenceLang) {
                    output.push("```" + (language === "luau" ? "lua" : language));
                } else if (fenceLang === "luau") {
                    output.push("```lua");
                } else {
                    output.push(line);
                }
                inFence = true;
            } else {
                output.push(line);
                inFence = false;
            }
            continue;
        }

        output.push(line);
    }

    return output.join("\n");
}

function stripApiPrefix(value) {
    return value.replace(/^(Class|Datatype|Enum|Global|Library|Classes)\./, "");
}

function parseApiMember(rest) {
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

function resolveLocalCategoryLink(prefix, rest, options, classLinkMap) {
    if (prefix !== "Classes") {
        return null;
    }
    if (!rest) {
        return null;
    }
    const basePath = options && options.routeBasePath ? `/${options.routeBasePath}` : "";
    const { name, member } = parseApiMember(rest);
    if (!name) {
        return null;
    }
    let link = null;
    if (classLinkMap && classLinkMap.has(name)) {
        const relativeLink = classLinkMap.get(name);
        link = basePath + "/" + relativeLink;
    } else {
        link = basePath + "/classes/" + sanitizeModulePath(name);
    }
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
    const { name, member } = parseApiMember(rest);
    if (!name) {
        return null;
    }
    let segment = null;
    if (prefix === "Class") {
        segment = "classes";
    } else if (prefix === "Datatype") {
        segment = "datatypes";
    } else if (prefix === "Enum") {
        segment = "enums";
    } else if (prefix === "Library") {
        segment = "libraries";
    } else if (prefix === "Global") {
        segment = "globals";
    } else {
        return null;
    }
    let link = `${base.replace(/\/+$/g, "")}/${segment}/${name}`;
    if (member) {
        const anchor = sanitizeAnchorId(cleanMemberName(member));
        if (anchor) {
            link += `#${anchor}`;
        }
    }
    return link;
}

function resolveApiTargetLink(target, options, classLinkMap) {
    if (!target || typeof target !== "string") {
        return null;
    }
    const match = target.match(/^([A-Za-z]+)\.(.+)$/);
    if (!match) {
        return null;
    }
    const prefix = match[1];
    const rest = match[2];
    const localLink = resolveLocalCategoryLink(prefix, rest, options, classLinkMap);
    if (localLink) {
        return localLink;
    }
    return resolveRobloxLink(prefix, rest, options);
}

function applyApiLinks(markdown, options, classLinkMap) {
    if (!markdown) {
        return markdown;
    }
    return markdown.replace(/`([^`\n]+)`/g, (full, content) => {
        const parts = content.split("|");
        const target = parts.shift().trim();
        const label = parts.length > 0 ? parts.join("|").trim() : null;
        if (label === "no-link") {
            return "`" + target + "`";
        }
        const link = resolveApiTargetLink(target, options, classLinkMap);
        const display = label && label.length > 0 ? label : stripApiPrefix(target);
        if (!link) {
            return "`" + (display || target) + "`";
        }
        return `[${display}](${link})`;
    });
}
function resolveFenceLanguage(options) {
    const configured = (options && options.codeFenceLanguage) || (options && options.lang) || "lua";
    if (configured === "luau") {
        return "lua";
    }
    return configured;
}

function normalizeCustomDocConfig(config) {
    if (!config || typeof config !== "object") {
        return null;
    }
    const normalized = {
        classes: [],
    };

    if (Array.isArray(config.classes)) {
        normalized.classes = config.classes;
    }

    return normalized;
}

function mergeCustomDocConfig(baseConfig, incoming) {
    if (!incoming) {
        return baseConfig;
    }
    const base = baseConfig || { classes: [] };
    if (Array.isArray(incoming.classes)) {
        if (!Array.isArray(base.classes)) {
            base.classes = [];
        }
        base.classes.push(...incoming.classes);
    }
    return base;
}

function runLuauCustomConfig(configPath) {
    const runnerPath = path.join(__dirname, "luau", "custom-doc-config-runner.luau");
    if (!fs.existsSync(runnerPath)) {
        console.warn(`[storybakery] custom doc config runner not found: ${runnerPath}`);
        return null;
    }

    const runnerDir = path.dirname(runnerPath);
    let configArg = path.relative(runnerDir, configPath).replace(/\\/g, "/");
    if (!configArg || configArg === "") {
        configArg = path.basename(configPath);
    }
    const absoluteLike = path.isAbsolute(configArg) || /^[A-Za-z]:\//.test(configArg);
    if (!absoluteLike && !configArg.startsWith(".") && !configArg.startsWith("@")) {
        configArg = `./${configArg}`;
    }
    const runnerArg = path.basename(runnerPath);
    const args = ["run", runnerArg, "--", configArg];
    const luneBinaries = process.platform === "win32"
        ? ["lune.exe", "lune.cmd", "lune"]
        : ["lune"];
    let result = null;
    for (const luneBinary of luneBinaries) {
        result = spawnSync(luneBinary, args, {
            cwd: runnerDir,
            encoding: "utf8",
        });
        if (!result.error || result.error.code !== "ENOENT") {
            break;
        }
    }

    if (result.error) {
        if (result.error.code === "ENOENT") {
            console.warn(`[storybakery] lune not found. skipping custom doc config: ${configPath}`);
        } else {
            console.warn(`[storybakery] failed to run lune for custom doc config: ${result.error.message}`);
        }
        return null;
    }

    if (result.status !== 0) {
        const stderr = (result.stderr || "").trim();
        console.warn(`[storybakery] custom doc config failed: ${configPath}`);
        if (stderr) {
            console.warn(stderr);
        }
        return null;
    }

    const output = (result.stdout || "").trim();
    if (!output) {
        console.warn(`[storybakery] custom doc config produced no output: ${configPath}`);
        return null;
    }

    try {
        return JSON.parse(output);
    } catch (error) {
        console.warn(`[storybakery] custom doc config JSON parse failed: ${configPath}`);
        console.warn(error.message);
        return null;
    }
}

function loadCustomDocConfigFile(configPath) {
    const ext = path.extname(configPath).toLowerCase();
    if (ext === ".json") {
        try {
            const raw = fs.readFileSync(configPath, "utf8");
            return normalizeCustomDocConfig(JSON.parse(raw));
        } catch (error) {
            console.warn(`[storybakery] custom doc config JSON parse failed: ${configPath}`);
            console.warn(error.message);
            return null;
        }
    }

    if (ext === ".lua" || ext === ".luau") {
        const config = runLuauCustomConfig(configPath);
        return normalizeCustomDocConfig(config);
    }

    return null;
}

function loadCustomDocConfig(siteDir, options) {
    const input = options && options.customDocConfig;
    if (!input) {
        return null;
    }
    if (typeof input === "object") {
        return normalizeCustomDocConfig(input);
    }
    if (typeof input !== "string") {
        return null;
    }

    const configPath = path.isAbsolute(input) ? input : path.resolve(siteDir, input);
    if (!fs.existsSync(configPath)) {
        console.warn(`[storybakery] custom doc config not found: ${configPath}`);
        return null;
    }

    const stat = fs.statSync(configPath);
    if (stat.isDirectory()) {
        const entries = fs.readdirSync(configPath);
        const files = entries
            .filter((entry) => !entry.startsWith(".") && !entry.startsWith("_"))
            .filter((entry) => {
                const ext = path.extname(entry).toLowerCase();
                return ext === ".lua" || ext === ".luau" || ext === ".json";
            })
            .sort((a, b) => a.localeCompare(b));

        let merged = null;
        for (const file of files) {
            const filePath = path.join(configPath, file);
            const loaded = loadCustomDocConfigFile(filePath);
            if (!loaded) {
                console.warn(`[storybakery] custom doc config skipped: ${filePath}`);
                continue;
            }
            merged = mergeCustomDocConfig(merged, loaded);
        }
        if (merged && Array.isArray(merged.classes)) {
            console.log(
                `[storybakery] custom doc config loaded: ${merged.classes.length} classes (${files.length} files)`
            );
        }
        return merged;
    }

    const loaded = loadCustomDocConfigFile(configPath);
    if (!loaded) {
        console.warn(`[storybakery] unsupported custom doc config format: ${configPath}`);
    } else if (Array.isArray(loaded.classes)) {
        console.log(`[storybakery] custom doc config loaded: ${loaded.classes.length} classes`);
    }
    return loaded;
}

function buildCustomQualifiedName(container, name) {
    const safeName = String(name || "")
        .replace(/[.:]/g, "_")
        .replace(/\s+/g, " ")
        .trim();
    return `${container}.${safeName}`;
}

function resolveExistingClass(referenceJson, className) {
    const modules = referenceJson && Array.isArray(referenceJson.modules) ? referenceJson.modules : [];
    for (const moduleData of modules) {
        const symbols = Array.isArray(moduleData.symbols) ? moduleData.symbols : [];
        for (const symbol of symbols) {
            if (symbol && symbol.kind === "class" && symbol.name === className) {
                return symbol;
            }
        }
    }
    return null;
}

function isPlainObject(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}

function normalizeDescription(value) {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value);
}

function appendTag(tags, name, value = undefined) {
    if (!name) {
        return;
    }
    const tagName = String(name).trim();
    if (!tagName) {
        return;
    }
    const payload = { name: tagName };
    if (value !== undefined && value !== null && value !== false) {
        const text = String(value).trim();
        if (text.length > 0) {
            payload.value = text;
        }
    }
    tags.push(payload);
}

function appendExplicitTags(tags, input) {
    if (!Array.isArray(input)) {
        return;
    }
    for (const entry of input) {
        if (!entry) {
            continue;
        }
        if (typeof entry === "string") {
            appendTag(tags, entry);
            continue;
        }
        if (!isPlainObject(entry)) {
            continue;
        }
        appendTag(tags, entry.name || entry.tag, entry.value);
    }
}

function buildDocsPayload(entry, defaultDescription, defaultGroup = null, extraTags = []) {
    const description = normalizeDescription(
        entry && (entry.description || entry.Description || entry.summary || defaultDescription || "")
    );
    const tags = [];
    for (const tag of extraTags) {
        if (!tag || !tag.name) {
            continue;
        }
        appendTag(tags, tag.name, tag.value);
    }

    const group = entry && (entry.group || entry.Group || defaultGroup);
    if (group) {
        appendTag(tags, "group", group);
    }
    if (entry && entry.readonly) {
        appendTag(tags, "readonly");
    }
    if (entry && entry.yields) {
        appendTag(tags, "yields");
    }
    if (entry && entry.server) {
        appendTag(tags, "server");
    }
    if (entry && entry.client) {
        appendTag(tags, "client");
    }
    if (entry && entry.plugin) {
        appendTag(tags, "plugin");
    }
    if (entry && entry.unreleased) {
        appendTag(tags, "unreleased");
    }
    if (entry && entry.since) {
        appendTag(tags, "since", entry.since);
    }
    if (entry && entry.deprecated) {
        appendTag(tags, "deprecated", entry.deprecated === true ? undefined : entry.deprecated);
    }
    if (entry && entry.category) {
        appendTag(tags, "category", entry.category);
    }
    if (entry && entry.withinDefault) {
        appendTag(tags, "withinDefault", entry.withinDefault);
    }
    appendExplicitTags(tags, entry && entry.tags);

    return {
        summary: description,
        descriptionMarkdown: description,
        tags,
    };
}

function pickArray(source, keys) {
    if (!isPlainObject(source)) {
        return [];
    }
    for (const key of keys) {
        if (Array.isArray(source[key])) {
            return source[key];
        }
    }
    return [];
}

function cloneMemberWithGroup(entry, groupName) {
    if (!entry) {
        return null;
    }
    if (isPlainObject(entry)) {
        const cloned = { ...entry };
        if (!cloned.group && groupName) {
            cloned.group = groupName;
        }
        return cloned;
    }
    return entry;
}

function expandClassMembers(spec) {
    const members = {
        types: [...pickArray(spec, ["types", "customTypes"])],
        interfaces: [...pickArray(spec, ["interfaces"])],
        props: [...pickArray(spec, ["props", "properties"])],
        methods: [...pickArray(spec, ["methods"])],
        events: [...pickArray(spec, ["events"])],
    };

    if (!isPlainObject(spec) || !isPlainObject(spec.groups)) {
        return members;
    }

    for (const [groupName, groupSpec] of Object.entries(spec.groups)) {
        if (!isPlainObject(groupSpec)) {
            continue;
        }
        const grouped = {
            types: pickArray(groupSpec, ["types", "customTypes"]),
            interfaces: pickArray(groupSpec, ["interfaces"]),
            props: pickArray(groupSpec, ["props", "properties"]),
            methods: pickArray(groupSpec, ["methods"]),
            events: pickArray(groupSpec, ["events"]),
        };
        for (const key of Object.keys(grouped)) {
            const entries = grouped[key];
            for (const entry of entries) {
                const merged = cloneMemberWithGroup(entry, groupName);
                if (merged) {
                    members[key].push(merged);
                }
            }
        }
    }

    return members;
}

function normalizeParamList(input) {
    if (!Array.isArray(input)) {
        return [];
    }
    const params = [];
    for (let i = 0; i < input.length; i += 1) {
        const entry = input[i];
        if (!entry) {
            continue;
        }
        if (typeof entry === "string") {
            params.push({
                name: `param${i + 1}`,
                type: entry,
                description: "",
            });
            continue;
        }
        if (!isPlainObject(entry)) {
            continue;
        }
        const name = entry.name || entry.Name || `param${i + 1}`;
        const type = entry.type || entry.TypeAnnotation || entry.annotation || "any";
        const mapped = {
            name: String(name),
            type: String(type),
            description: normalizeDescription(entry.description || entry.Description || ""),
        };
        const defaultValue = entry.default ?? entry.defaultValue ?? entry.Default;
        if (defaultValue !== undefined && defaultValue !== null) {
            mapped.default = String(defaultValue);
        }
        params.push(mapped);
    }
    return params;
}

function normalizeTypeEntries(input) {
    if (!Array.isArray(input)) {
        return [];
    }
    const mapped = [];
    for (const entry of input) {
        if (!entry) {
            continue;
        }
        if (typeof entry === "string") {
            mapped.push({ type: String(entry), description: "" });
            continue;
        }
        if (!isPlainObject(entry)) {
            continue;
        }
        const typeValue = entry.type || entry.TypeAnnotation || "any";
        mapped.push({
            type: String(typeValue),
            description: normalizeDescription(entry.description || entry.Description || ""),
        });
    }
    return mapped;
}

function normalizeInterfaceFields(input) {
    if (!Array.isArray(input)) {
        return [];
    }
    const fields = [];
    for (let i = 0; i < input.length; i += 1) {
        const entry = input[i];
        if (!entry) {
            continue;
        }
        if (!isPlainObject(entry)) {
            continue;
        }
        const name = entry.name || entry.Name || `field${i + 1}`;
        const type = entry.type || entry.TypeAnnotation || "any";
        fields.push({
            name: String(name),
            type: String(type),
            description: normalizeDescription(entry.description || entry.Description || ""),
        });
    }
    return fields;
}

function formatParamSignature(params) {
    if (!params || params.length === 0) {
        return "";
    }
    return params.map((param) => `${param.name}: ${param.type || "any"}`).join(", ");
}

function formatReturnSignature(returns) {
    if (!returns || returns.length === 0) {
        return "";
    }
    if (returns.length === 1) {
        return returns[0].type || "any";
    }
    return `(${returns.map((item) => item.type || "any").join(", ")})`;
}

function buildFunctionDisplay(within, name, separator, params, returns) {
    const left = `${within}${separator}${name}(${formatParamSignature(params)})`;
    const returnSignature = formatReturnSignature(returns);
    if (!returnSignature) {
        return left;
    }
    return `${left}: ${returnSignature}`;
}

function buildInterfaceDisplay(fields) {
    if (!fields || fields.length === 0) {
        return "{}";
    }
    const lines = ["{"]; 
    for (const field of fields) {
        lines.push(`    ${field.name}: ${field.type},`);
    }
    lines.push("}");
    return lines.join("\n");
}

function injectCustomTypes(referenceJson, options) {
    const config = options && options.customDocConfig;
    if (!config) {
        return;
    }

    const symbols = [];

    const classSpecs = Array.isArray(config.classes) ? config.classes : null;
    if (classSpecs && classSpecs.length > 0) {
        for (const spec of classSpecs) {
            if (!isPlainObject(spec)) {
                continue;
            }
            const containerName = spec.name || spec.className;
            if (!containerName) {
                continue;
            }
            const category = spec.category || null;
            const description = normalizeDescription(
                spec.description || "Docgen scripts에서 제공된 문서 심볼입니다."
            );
            const defaultGroup = spec.group || null;
            const members = expandClassMembers(spec);

            const existingClass = resolveExistingClass(referenceJson, containerName);
            if (!existingClass) {
                const classTags = [];
                if (category) {
                    appendTag(classTags, "category", category);
                }
                appendExplicitTags(classTags, spec.tags);

                symbols.push({
                    kind: "class",
                    name: containerName,
                    qualifiedName: containerName,
                    visibility: "public",
                    docs: {
                        summary: description,
                        descriptionMarkdown: description,
                        tags: classTags,
                    },
                    types: {
                        display: "",
                        structured: { indexName: null },
                    },
                });
            }

            for (const entry of members.types) {
                if (!isPlainObject(entry)) {
                    continue;
                }
                const name = entry.name || entry.Name;
                const rawType = entry.type || entry.TypeAnnotation;
                if (!name || !rawType) {
                    continue;
                }
                const within = entry.within || entry.Within || containerName;
                const qualifiedName = buildCustomQualifiedName(within, name);
                const typeValue = String(rawType);
                const desc = normalizeDescription(entry.description || entry.Description || "");
                symbols.push({
                    kind: "type",
                    name: String(name),
                    qualifiedName,
                    visibility: "public",
                    docs: buildDocsPayload(entry, desc, defaultGroup),
                    types: {
                        display: typeValue,
                        structured: { type: typeValue },
                    },
                });
            }

            for (const entry of members.interfaces) {
                if (!isPlainObject(entry)) {
                    continue;
                }
                const name = entry.name || entry.Name;
                if (!name) {
                    continue;
                }
                const within = entry.within || entry.Within || containerName;
                const fields = normalizeInterfaceFields(
                    pickArray(entry, ["fields", "props", "properties"])
                );
                const desc = normalizeDescription(entry.description || entry.Description || "");
                const display = entry.display
                    ? String(entry.display)
                    : buildInterfaceDisplay(fields);

                symbols.push({
                    kind: "interface",
                    name: String(name),
                    qualifiedName: buildCustomQualifiedName(within, name),
                    visibility: "public",
                    docs: buildDocsPayload(entry, desc, defaultGroup),
                    types: {
                        display,
                        structured: { fields },
                    },
                });
            }

            for (const entry of members.props) {
                if (!isPlainObject(entry)) {
                    continue;
                }
                const name = entry.name || entry.Name;
                if (!name) {
                    continue;
                }
                const within = entry.within || entry.Within || containerName;
                const typeValue = String(entry.type || entry.TypeAnnotation || "any");
                const desc = normalizeDescription(entry.description || entry.Description || "");
                const display = entry.display
                    ? String(entry.display)
                    : `${within}.${name}: ${typeValue}`;

                symbols.push({
                    kind: "property",
                    name: String(name),
                    qualifiedName: `${within}.${name}`,
                    visibility: "public",
                    docs: buildDocsPayload(entry, desc, defaultGroup),
                    types: {
                        display,
                        structured: { type: typeValue },
                    },
                });
            }

            for (const entry of members.methods) {
                if (!isPlainObject(entry)) {
                    continue;
                }
                const name = entry.name || entry.Name;
                if (!name) {
                    continue;
                }
                const within = entry.within || entry.Within || containerName;
                const separator = (entry.static === true || entry.isStatic === true) ? "." : ":";
                const params = normalizeParamList(entry.params);
                const returns = normalizeTypeEntries(entry.returns);
                const errors = normalizeTypeEntries(entry.errors);
                const desc = normalizeDescription(entry.description || entry.Description || "");
                const display = entry.display
                    ? String(entry.display)
                    : buildFunctionDisplay(within, name, separator, params, returns);
                const structured = {
                    params,
                    returns,
                    errors,
                };
                if (entry.yields !== undefined) {
                    structured.yields = Boolean(entry.yields);
                }

                symbols.push({
                    kind: "method",
                    name: String(name),
                    qualifiedName: `${within}${separator}${name}`,
                    visibility: "public",
                    docs: buildDocsPayload(entry, desc, defaultGroup),
                    types: {
                        display,
                        structured,
                    },
                });
            }

            for (const entry of members.events) {
                if (!isPlainObject(entry)) {
                    continue;
                }
                const name = entry.name || entry.Name;
                if (!name) {
                    continue;
                }
                const within = entry.within || entry.Within || containerName;
                const params = normalizeParamList(entry.params);
                const returns = normalizeTypeEntries(entry.returns);
                const errors = normalizeTypeEntries(entry.errors);
                const desc = normalizeDescription(entry.description || entry.Description || "");
                const display = entry.display
                    ? String(entry.display)
                    : buildFunctionDisplay(within, name, ".", params, returns);
                const structured = {
                    params,
                    returns,
                    errors,
                };
                if (entry.yields !== undefined) {
                    structured.yields = Boolean(entry.yields);
                }

                symbols.push({
                    kind: "event",
                    name: String(name),
                    qualifiedName: `${within}.${name}`,
                    visibility: "public",
                    docs: buildDocsPayload(entry, desc, defaultGroup),
                    types: {
                        display,
                        structured,
                    },
                });
            }
        }
    }

    if (symbols.length === 0) {
        return;
    }

    if (!referenceJson.modules || !Array.isArray(referenceJson.modules)) {
        referenceJson.modules = [];
    }

    referenceJson.modules.push({
        id: "__custom_docgen_types__",
        path: "",
        sourceHash: "",
        symbols,
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

    const customDocConfig =
        typeof opts.customDocConfig === "string"
            ? resolvePath(siteDir, opts.customDocConfig, null)
            : opts.customDocConfig || null;

    return {
        lang,
        input,
        outDir,
        manifestPath,
        routeBasePath,
        renderMode: opts.renderMode || "mdx",
        clean: opts.clean !== false,
        includePrivate: opts.includePrivate === true,
        overviewTitle: opts.overviewTitle || "Overview",
        defaultCategory: opts.defaultCategory || "Classes",
        categoryOrder: Array.isArray(opts.categoryOrder) ? opts.categoryOrder : [],
        codeTabSize: typeof opts.codeTabSize === "number" ? opts.codeTabSize : null,
        source: opts.source || detectDefaultSource(siteDir),
        customDocConfig,
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

function pruneEmptyDirs(dir) {
    if (!fs.existsSync(dir)) {
        return;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isDirectory()) {
            continue;
        }
        pruneEmptyDirs(path.join(dir, entry.name));
    }

    const remaining = fs.readdirSync(dir);
    if (remaining.length === 0) {
        fs.rmdirSync(dir);
    }
}

function sortSymbols(symbols) {
    return symbols.slice().sort((left, right) => {
        const leftName = left.qualifiedName || left.name || "";
        const rightName = right.qualifiedName || right.name || "";
        return leftName.localeCompare(rightName);
    });
}

function getTagValues(symbol, name) {
    const tags = symbol && symbol.docs && Array.isArray(symbol.docs.tags) ? symbol.docs.tags : [];
    return tags
        .filter((tag) => tag.name === name && tag.value)
        .map((tag) => tag.value);
}

function hasEventTag(symbol) {
    const tags = symbol && symbol.docs && Array.isArray(symbol.docs.tags) ? symbol.docs.tags : [];
    return tags.some((tag) => {
        if (tag.name === "event") {
            return true;
        }
        return tag.name === "tag" && String(tag.value).toLowerCase() === "event";
    });
}

function getQualifiedSeparator(symbol) {
    if (!symbol || !symbol.qualifiedName) {
        return null;
    }
    if (symbol.qualifiedName.includes(":")) {
        return ":";
    }
    if (symbol.qualifiedName.includes(".")) {
        return ".";
    }
    return null;
}

function getGroupKind(symbol) {
    const kind = (symbol && symbol.kind) || "module";
    if (kind === "interface") {
        return "type";
    }
    if (kind === "constructor") {
        return "constructor";
    }
    if (kind === "function") {
        const separator = getQualifiedSeparator(symbol);
        if (separator === ":" && symbol.name) {
            return "method";
        }
        if (symbol.name === "new" && separator === "." && extractWithin(symbol)) {
            return "constructor";
        }
    }
    if (hasEventTag(symbol) && kind !== "class" && kind !== "module") {
        return "event";
    }
    if (kind === "field") {
        return "interface";
    }
    return kind;
}

function groupSymbols(symbols) {
    const groups = new Map();
    for (const symbol of symbols) {
        const kind = getGroupKind(symbol);
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

function extractWithin(symbol) {
    if (!symbol || !symbol.qualifiedName) {
        return null;
    }
    const value = symbol.qualifiedName;
    const colonIndex = value.indexOf(":");
    if (colonIndex !== -1) {
        let within = value.slice(0, colonIndex);
        if (within.endsWith(".prototype")) {
            within = within.slice(0, -".prototype".length);
        }
        return within;
    }
    const dotIndex = value.lastIndexOf(".");
    if (dotIndex !== -1) {
        let within = value.slice(0, dotIndex);
        if (within.endsWith(".prototype")) {
            within = within.slice(0, -".prototype".length);
        }
        return within;
    }
    return null;
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

function sanitizeCategoryPath(value) {
    if (!value) {
        return "";
    }
    return sanitizeModulePath(value);
}

function buildCategoryMeta(label, position, collapsed) {
    const payload = { label };
    if (typeof position === "number") {
        payload.position = position;
    }
    if (typeof collapsed === "boolean") {
        payload.collapsed = collapsed;
    }
    return `${JSON.stringify(payload, null, 2)}\n`;
}

function collectCategoryPaths(categories) {
    const paths = new Map();
    for (const category of categories) {
        const normalized = sanitizeCategoryPath(category);
        if (!normalized) {
            continue;
        }
        const parts = normalized.split("/").map((part) => part.trim()).filter(Boolean);
        let current = "";
        for (const part of parts) {
            current = current ? `${current}/${part}` : part;
            if (!paths.has(current)) {
                paths.set(current, part);
            }
        }
    }
    return paths;
}

function getSymbolCategories(symbol) {
    const tags = symbol && symbol.docs && Array.isArray(symbol.docs.tags) ? symbol.docs.tags : [];
    const categories = tags
        .filter((tag) => tag && tag.name === "category" && tag.value)
        .map((tag) => String(tag.value));
    return categories;
}

function getSymbolGroups(symbol) {
    const tags = symbol && symbol.docs && Array.isArray(symbol.docs.tags) ? symbol.docs.tags : [];
    const groups = tags
        .filter((tag) => tag && tag.name === "group" && tag.value)
        .map((tag) => String(tag.value));
    return groups;
}

function getPrimaryGroup(symbol) {
    const groups = getSymbolGroups(symbol);
    if (!groups || groups.length === 0) {
        return null;
    }
    const value = String(groups[0]).trim();
    return value ? value : null;
}

function buildClassSections(members, usedAnchorIds) {
    const groupedByKind = groupSymbols(members || []);
    const sections = [];
    const sectionMap = new Map();

    for (const kind of SECTION_ORDER) {
        const items = groupedByKind.get(kind);
        if (!items || items.length === 0) {
            continue;
        }
        for (const symbol of items) {
            const headingLabel = symbol.name || symbol.qualifiedName || "Unnamed";
            const anchorId = createAnchorId(symbol, headingLabel, usedAnchorIds);
            const groupLabel = getPrimaryGroup(symbol);
            if (groupLabel) {
                const key = `group:${groupLabel}`;
                let section = sectionMap.get(key);
                if (!section) {
                    section = { label: groupLabel, kind, entries: [] };
                    sectionMap.set(key, section);
                    sections.push(section);
                }
                section.entries.push({ symbol, anchorId });
            } else {
                const label = KIND_LABELS[kind] || kind;
                const key = `kind:${kind}`;
                let section = sectionMap.get(key);
                if (!section) {
                    section = { label, kind, entries: [] };
                    sectionMap.set(key, section);
                    sections.push(section);
                }
                section.entries.push({ symbol, anchorId });
            }
        }
    }

    const kindAnchors = new Set();
    for (const section of sections) {
        if (section.kind) {
            kindAnchors.add(getSectionAnchorId(section.kind));
        }
    }
    for (const anchor of kindAnchors) {
        usedAnchorIds.add(anchor);
    }

    for (const section of sections) {
        if (section.kind) {
            section.anchorId = getSectionAnchorId(section.kind);
        } else {
            section.anchorId = createAnchorId(null, section.label, usedAnchorIds);
        }
    }

    return sections;
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

function escapeHtmlText(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
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

function getSectionAnchorId(kind) {
    const label = KIND_LABELS[kind] || kind;
    const fallback = label.toLowerCase().replace(/s+/g, "-");
    return sanitizeAnchorId(label) || fallback;
}

function renderSymbol(symbol, options, usedAnchorIds, anchorOverride = null, headingOverride = null, classLinkMap = null) {
    const headingLabel = headingOverride || symbol.name || symbol.qualifiedName || "Unnamed";
    const headingText = escapeHtmlText(headingLabel);
    let anchorId = anchorOverride;
    if (anchorId) {
        usedAnchorIds.add(anchorId);
    } else {
        anchorId = createAnchorId(symbol, headingLabel, usedAnchorIds);
    }
    const sourceUrl = resolveSourceUrl(symbol.location, options && options.source);
    const heading = anchorId ? `### ${headingText} {#${anchorId}}` : `### ${headingText}`;
    const lines = [heading];
    if (sourceUrl) {
        const label = (options && options.source && options.source.icon) || DEFAULT_SOURCE_ICON;
        lines.push(`<div class="sb-ref-heading-actions"><a class="sb-ref-source sb-ref-source-inline" href="${sourceUrl}">${label}</a></div>`);
    }

    const typeInfo = resolveTypeDisplay(symbol);
    const typeDisplay = typeInfo.typeDisplay;
    if (typeDisplay) {
        const fenceLang = resolveFenceLanguage(options);
        lines.push("", "```" + fenceLang, typeDisplay, "```");
    }

    const descriptionRaw = symbol.docs && symbol.docs.descriptionMarkdown;
    const normalized = applyDefaultFenceLanguage(descriptionRaw, options.lang || "luau");
    const withApiLinks = applyApiLinks(normalized, options, classLinkMap);
    const description = rewriteLegacyApiLinks(withApiLinks, options);
    const summary = symbol.docs && symbol.docs.summary;
    if (description && description.trim().length > 0) {
        lines.push("", description);
    } else if (summary && summary.trim().length > 0) {
        lines.push("", summary);
    } else if (typeInfo.extraDescription) {
        lines.push("", typeInfo.extraDescription);
    }

    const detailBadges = renderDetailBadges(symbol, options);
    if (detailBadges) {
        lines.push("", `<div class="sb-ref-detail-tags">${detailBadges}</div>`);
    }

    if (symbol && symbol.kind === "interface") {
        lines.push(...renderInterfaceFieldList(symbol, classLinkMap));
    }

    if (symbol && (symbol.kind === "function" || symbol.kind === "method" || symbol.kind === "constructor" || symbol.kind === "event")) {
        const sectionOrder = ["params", "returns", "errors"];
        const sectionTitles = {
            params: "Parameters",
            returns: "Returns",
            errors: "Errors",
        };
        for (const kind of sectionOrder) {
            if (kind === "params") {
                lines.push(...renderParamSection(symbol, classLinkMap, sectionTitles.params));
            } else if (kind === "returns") {
                lines.push(...renderReturnSection(symbol, classLinkMap, sectionTitles.returns));
            } else if (kind === "errors") {
                lines.push(...renderErrorSection(symbol, classLinkMap, sectionTitles.errors));
            }
        }
    }


    // Tags are displayed as badges in the summary section, not as text here
    // const tags = symbol.docs && Array.isArray(symbol.docs.tags) ? symbol.docs.tags : [];
    // if (tags.length > 0) {
    //     lines.push("", "Tags:");
    //     for (const tag of tags) {
    //         const value = tag.value !== undefined ? `: ${tag.value}` : "";
    //         lines.push(`- ${tag.name}${value}`);
    //     }
    // }

    return lines.join("\n");
}
function renderSymbolBody(symbol, options, classLinkMap) {
    const lines = [];

    const typeInfo = resolveTypeDisplay(symbol);
    const typeDisplay = typeInfo.typeDisplay;
    if (typeDisplay) {
        const fenceLang = resolveFenceLanguage(options);
        lines.push("", "```" + fenceLang, typeDisplay, "```");
    }

    const descriptionRaw = symbol.docs && symbol.docs.descriptionMarkdown;
    const normalized = applyDefaultFenceLanguage(descriptionRaw, options.lang || "luau");
    const withApiLinks = applyApiLinks(normalized, options, classLinkMap);
    const description = rewriteLegacyApiLinks(withApiLinks, options);
    const summary = symbol.docs && symbol.docs.summary;
    if (description && description.trim().length > 0) {
        lines.push("", description);
    } else if (summary && summary.trim().length > 0) {
        lines.push("", summary);
    } else if (typeInfo.extraDescription) {
        lines.push("", typeInfo.extraDescription);
    }

    return lines.join("\n");
}

function resolveClassHref(className, classLinkMap) {
    if (!className || !classLinkMap) {
        return null;
    }
    return classLinkMap.get(className) || null;
}


const DEFAULT_SOURCE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="sb-ref-source-icon"><path fill="currentColor" d="M7.4 16.6 3 12l4.4-4.6L6 6l-6 6 6 6 1.4-1.4zM16.6 16.6 21 12l-4.4-4.6L18 6l6 6-6 6-1.4-1.4zM9.5 19l4-14h1.9l-4 14z"/></svg>`;

function resolveSourceUrl(location, source) {
    if (!location || !location.file || !source || !source.repoUrl) {
        return null;
    }
    const repoUrl = String(source.repoUrl).replace(/\/+$/g, "");
    const branch = source.branch || "main";
    const basePath = source.basePath ? String(source.basePath).replace(/\/+$/g, "") : "";
    let relative = location.file.replace(/\\/g, "/");
    if (source.stripPrefix && relative.startsWith(source.stripPrefix)) {
        relative = relative.slice(source.stripPrefix.length);
        if (relative.startsWith("/")) {
            relative = relative.slice(1);
        }
    }
    const parts = [repoUrl, branch];
    if (basePath) {
        parts.push(basePath);
    }
    parts.push(relative);
    let url = parts.join("/");
    if (location.line) {
        url += `#L${location.line}`;
    }
    return url;
}

// Roblox-style member icons (SVG) - Custom Designs matching user images
// Property: Solid Blue Cube
const ICON_PROPERTY = `<svg width="14" height="14" class="sb-ref-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1L14.5 4.5V11.5L8 15L1.5 11.5V4.5L8 1Z" fill="#00A2FF" stroke="#00A2FF" stroke-width="1"/><path d="M1.5 4.5L8 8L14.5 4.5" stroke="rgba(255,255,255,0.3)" stroke-width="1"/><path d="M8 8V15" stroke="rgba(255,255,255,0.3)" stroke-width="1"/></svg>`;

// Method: Purple Cube with Motion Lines
const ICON_METHOD = `<svg width="14" height="14" class="sb-ref-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 3.5L13.5 6V11L9 13.5L4.5 11V6L9 3.5Z" fill="#9F70EA"/><path d="M1 6H3" stroke="#9F70EA" stroke-width="1.5" stroke-linecap="round"/><path d="M0.5 8.5H3" stroke="#9F70EA" stroke-width="1.5" stroke-linecap="round"/><path d="M1 11H3" stroke="#9F70EA" stroke-width="1.5" stroke-linecap="round"/></svg>`;

// Event: Yellow Lightning
const ICON_EVENT = `<svg width="14" height="14" class="sb-ref-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 1L4 8H8L6 15L13 7H9L9 1Z" fill="#F2C94C" stroke="#F2994A" stroke-width="0.5"/></svg>`;

const KIND_ICONS = Object.create(null);
KIND_ICONS.property = ICON_PROPERTY;
KIND_ICONS.method = ICON_METHOD;
KIND_ICONS.function = ICON_METHOD; // Functions treated as methods
KIND_ICONS.event = ICON_EVENT;
// Types, Interfaces, Constructors do NOT have icons

function getKindIcon(kind) {
    if (!kind) {
        return null;
    }
    return Object.prototype.hasOwnProperty.call(KIND_ICONS, kind)
        ? KIND_ICONS[kind]
        : null;
}

function renderTagBadges(symbol, options) {
    const tags = symbol && symbol.docs && Array.isArray(symbol.docs.tags) ? symbol.docs.tags : [];
    const badges = [];
    for (const tag of tags) {
        if (tag.name === "deprecated") {
            badges.push(`<span class="sb-ref-badge sb-ref-badge-deprecated">Deprecated</span>`);
        } else if (tag.name === "readonly") {
            // ReadOnly는 배지 대신 텍스트로 표시하는 경우가 많으나 요청대로 배지로 유지하되 스타일 단축 가능
            badges.push(`<span class="sb-ref-badge sb-ref-badge-readonly">ReadOnly</span>`);
        } else if (tag.name === "yields") {
            badges.push(`<span class="sb-ref-badge sb-ref-badge-yields">Yields</span>`);
        } else if (tag.name === "server") {
            badges.push(`<span class="sb-ref-badge sb-ref-badge-server">Server</span>`);
        } else if (tag.name === "client") {
            badges.push(`<span class="sb-ref-badge sb-ref-badge-client">Client</span>`);
        } else if (tag.name === "plugin") {
            badges.push(`<span class="sb-ref-badge sb-ref-badge-plugin">Plugin</span>`);
        }
    }
    return badges.join(" ");
}

function renderDetailBadges(symbol, options) {
    const tags = symbol && symbol.docs && Array.isArray(symbol.docs.tags) ? symbol.docs.tags : [];
    const badges = [];
    for (const tag of tags) {
        if (!tag || !tag.name) {
            continue;
        }
        if (tag.name === "deprecated") {
            const label = tag.value ? `Deprecated ${escapeHtmlText(tag.value)}` : "Deprecated";
            badges.push(`<span class="sb-ref-badge sb-ref-badge-deprecated">${label}</span>`);
        } else if (tag.name === "readonly") {
            badges.push(`<span class="sb-ref-badge sb-ref-badge-readonly">ReadOnly</span>`);
        } else if (tag.name === "yields") {
            badges.push(`<span class="sb-ref-badge sb-ref-badge-yields">Yields</span>`);
        } else if (tag.name === "server") {
            badges.push(`<span class="sb-ref-badge sb-ref-badge-server">Server</span>`);
        } else if (tag.name === "client") {
            badges.push(`<span class="sb-ref-badge sb-ref-badge-client">Client</span>`);
        } else if (tag.name === "plugin") {
            badges.push(`<span class="sb-ref-badge sb-ref-badge-plugin">Plugin</span>`);
        } else if (tag.name === "unreleased") {
            badges.push(`<span class="sb-ref-badge sb-ref-badge-unreleased">Unreleased</span>`);
        } else if (tag.name === "since") {
            const label = tag.value ? `Since ${escapeHtmlText(tag.value)}` : "Since";
            badges.push(`<span class="sb-ref-badge sb-ref-badge-since">${label}</span>`);
        } else if (tag.name === "tag" && tag.value) {
            badges.push(`<span class="sb-ref-badge sb-ref-badge-tag">${escapeHtmlText(tag.value)}</span>`);
        }
    }
    return badges.join(" ");
}

/**
 * Convert type references to links
 * @param {string} typeText - The type string (e.g., "DateTime", "Enum.AccessoryType")
 * @param {Map} classLinkMap - Map of class names to their doc URLs
 * @returns {string} - HTML with linked types
 */
function linkifyTypes(typeText, classLinkMap) {
    if (!typeText || !classLinkMap) {
        return escapeHtml(typeText);
    }

    // Pattern to match type names: PascalCase words, Enum.Something, generics
    const typePattern = /\b([A-Z][a-zA-Z0-9]*(?:\.[A-Z][a-zA-Z0-9]*)?)\b/g;

    let result = typeText;
    const matches = [...typeText.matchAll(typePattern)];

    // Process matches in reverse to maintain correct positions
    for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i];
        const typeName = match[1];
        const startPos = match.index;
        const endPos = startPos + typeName.length;

        // Check if this type has a link
        if (classLinkMap.has(typeName)) {
            const href = classLinkMap.get(typeName);
            const before = result.substring(0, startPos);
            const after = result.substring(endPos);
            result = before + `<a href="${href}">${escapeHtml(typeName)}</a>` + after;
        }
    }

    // Escape the parts that weren't linked
    // Split by <a> tags, escape non-tag parts
    const parts = result.split(/(<a[^>]*>.*?<\/a>)/);
    result = parts.map((part, idx) => {
        if (idx % 2 === 0) {
            // Not a link, escape it (escapeHtml handles braces for MDX)
            return escapeHtml(part);
        }
        // Already a link, keep as is
        return part;
    }).join("");

    return result;
}

function getInterfaceFields(symbol) {
    if (!symbol || symbol.kind !== "interface") {
        return [];
    }
    const structured = symbol.types && symbol.types.structured;
    if (structured && Array.isArray(structured.fields)) {
        return structured.fields;
    }
    if (symbol.types && Array.isArray(symbol.types.fields)) {
        return symbol.types.fields;
    }
    return [];
}

function normalizeFieldDescription(value) {
    if (!value) {
        return "";
    }
    const raw = Array.isArray(value) ? value.join(" ") : String(value);
    return raw.replace(/\r?\n/g, " ").trim();
}

function renderInterfaceFieldList(symbol, classLinkMap) {
    const fields = getInterfaceFields(symbol);
    if (!fields || fields.length === 0) {
        return [];
    }

    const lines = [];
    lines.push("", `<div class="sb-ref-list">`);
    for (const field of fields) {
        const name = escapeHtmlText(field && field.name ? field.name : "Unnamed");
        const type = field && field.type ? linkifyTypes(field.type, classLinkMap) : "";
        const description = normalizeFieldDescription(field && field.description);

        let rowHtml = `<div class="sb-ref-row"><span class="sb-ref-cell-content">`;
        rowHtml += `<span class="sb-ref-name">${name}</span>`;
        if (type) {
            rowHtml += ` <span class="sb-ref-separator">:</span> <span class="sb-ref-type">${type}</span>`;
        }
        if (description) {
            rowHtml += ` <span class="sb-ref-interface-desc">- ${escapeHtml(description)}</span>`;
        }
        rowHtml += `</span></div>`;
        lines.push(rowHtml);
    }
    lines.push(`</div>`);

    return lines;
}

function getFunctionStructured(symbol) {
    if (!symbol || !symbol.types) {
        return null;
    }
    const structured = symbol.types.structured;
    if (structured && (structured.params || structured.returns || structured.errors || structured.yields !== undefined)) {
        return structured;
    }
    if (symbol.types.params || symbol.types.returns || symbol.types.errors) {
        return {
            params: symbol.types.params || [],
            returns: symbol.types.returns || [],
            errors: symbol.types.errors || [],
            yields: symbol.types.yields,
        };
    }
    return null;
}

function normalizeParamDescription(value) {
    if (!value) {
        return "";
    }
    const raw = Array.isArray(value) ? value.join(" ") : String(value);
    return raw.replace(/\r?\n/g, " ").trim();
}

function renderParamSection(symbol, classLinkMap, heading = "Parameters") {
    const structured = getFunctionStructured(symbol);
    const params = structured && Array.isArray(structured.params) ? structured.params : [];
    if (!params || params.length === 0) {
        return [];
    }

    const lines = [];
    lines.push("", `#### ${escapeHtmlText(heading)}`);
    lines.push("", `<div class="sb-ref-param-list">`);
    for (const param of params) {
        const name = escapeHtmlText(param && param.name ? param.name : "param");
        const type = param && param.type ? linkifyTypes(param.type, classLinkMap) : "";
        const description = normalizeParamDescription(param && param.description);

        let rowHtml = `<div class="sb-ref-param-card">`;
        rowHtml += `<div class="sb-ref-param-name"><code>${name}</code>`;
        if (type) {
            rowHtml += ` <span class="sb-ref-param-type">${type}</span>`;
        }
        rowHtml += `</div>`;
        if (description) {
            rowHtml += `<div class="sb-ref-param-desc">${escapeHtml(description)}</div>`;
        }
        const defaultValue = param && (param.default ?? param.defaultValue);
        if (defaultValue !== null && defaultValue !== undefined) {
            const normalizedDefault = String(defaultValue).trim();
            if (normalizedDefault.length > 0) {
                rowHtml += `<div class="sb-ref-param-meta"><span>Default Value</span><code>${escapeHtml(normalizedDefault)}</code></div>`;
            }
        }
        rowHtml += `</div>`;
        lines.push(rowHtml);
    }
    lines.push(`</div>`);
    return lines;
}

function renderReturnSection(symbol, classLinkMap, heading = "Returns") {
    const structured = getFunctionStructured(symbol);
    const returns = structured && Array.isArray(structured.returns) ? structured.returns : [];
    if (!returns || returns.length === 0) {
        return [];
    }

    const lines = [];
    lines.push("", `#### ${escapeHtmlText(heading)}`);
    lines.push("", `<div class="sb-ref-param-list">`);
    for (const ret of returns) {
        const type = ret && ret.type ? linkifyTypes(ret.type, classLinkMap) : "";
        const description = normalizeParamDescription(ret && ret.description);

        let rowHtml = `<div class="sb-ref-param-card">`;
        rowHtml += `<div class="sb-ref-param-name"><code>return</code>`;
        if (type) {
            rowHtml += ` <span class="sb-ref-param-type">${type}</span>`;
        } else {
            rowHtml += ` <span class="sb-ref-param-type">any</span>`;
        }
        rowHtml += `</div>`;
        if (description) {
            rowHtml += `<div class="sb-ref-param-desc">${escapeHtml(description)}</div>`;
        }
        rowHtml += `</div>`;
        lines.push(rowHtml);
    }
    lines.push(`</div>`);
    return lines;
}

function renderErrorSection(symbol, classLinkMap, heading = "Errors") {
    const structured = getFunctionStructured(symbol);
    const errors = structured && Array.isArray(structured.errors) ? structured.errors : [];
    if (!errors || errors.length === 0) {
        return [];
    }

    const lines = [];
    lines.push("", `#### ${escapeHtmlText(heading)}`);
    lines.push("", `<div class="sb-ref-param-list">`);
    for (const err of errors) {
        const type = err && err.type ? linkifyTypes(err.type, classLinkMap) : "";
        const description = normalizeParamDescription(err && err.description);

        let rowHtml = `<div class="sb-ref-param-card">`;
        rowHtml += `<div class="sb-ref-param-name"><code>error</code>`;
        if (type) {
            rowHtml += ` <span class="sb-ref-param-type">${type}</span>`;
        } else {
            rowHtml += ` <span class="sb-ref-param-type">any</span>`;
        }
        rowHtml += `</div>`;
        if (description) {
            rowHtml += `<div class="sb-ref-param-desc">${escapeHtml(description)}</div>`;
        }
        rowHtml += `</div>`;
        lines.push(rowHtml);
    }
    lines.push(`</div>`);
    return lines;
}

function getExtendsClassName(symbol) {
    const tags = symbol && symbol.docs && Array.isArray(symbol.docs.tags) ? symbol.docs.tags : [];
    const extendTag = tags.find(tag => tag && tag.name === "extends");
    return extendTag ? extendTag.value : null;
}

function resolvePath(siteDir, value, fallback) {
    const target = value || fallback;
    if (!target) {
        return null;
    }
    return path.isAbsolute(target) ? target : path.resolve(siteDir, target);
}


function findGitRoot(startDir) {
    let current = startDir;
    while (current && current !== path.dirname(current)) {
        if (fs.existsSync(path.join(current, ".git"))) {
            return current;
        }
        current = path.dirname(current);
    }
    return null;
}


function normalizeRepoUrl(remoteUrl) {
    if (!remoteUrl) {
        return null;
    }
    // Convert SSH to HTTPS
    let urlIndex = remoteUrl;
    if (urlIndex.startsWith("git@")) {
        urlIndex = urlIndex.replace(":", "/").replace("git@", "https://");
    }
    if (urlIndex.endsWith(".git")) {
        urlIndex = urlIndex.slice(0, -4);
    }
    return urlIndex;
}

function getAllInheritedMembers(classSymbol, classMap) {
    const results = [];
    if (!classSymbol || !classMap) {
        return results;
    }
    let currentName = getExtendsClassName(classSymbol);
    const visited = new Set();
    if (classSymbol.name) {
        visited.add(classSymbol.name);
    }

    while (currentName) {
        if (visited.has(currentName)) {
            break;
        }
        visited.add(currentName);

        const entry = classMap.get(currentName);
        if (!entry) {
            break;
        }

        results.push({
            className: currentName,
            members: entry.members || [],
        });

        currentName = getExtendsClassName(entry.classSymbol);
    }
    return results;
}

function getChildClasses(className, classMap) {
    if (!classMap || !className) {
        return [];
    }
    const children = [];
    for (const [name, entry] of classMap.entries()) {
        if (!entry.classSymbol) {
            continue;
        }
        const parentName = getExtendsClassName(entry.classSymbol);
        if (parentName === className) {
            children.push(name);
        }
    }
    children.sort((a, b) => a.localeCompare(b));
    return children;
}

function renderInheritedBy(className, classMap, classLinkMap) {
    const children = getChildClasses(className, classMap);
    if (!children || children.length === 0) {
        return [];
    }

    const MAX_VISIBLE = 10;
    const contentLines = [];
    contentLines.push("", "#### Inherited By");
    contentLines.push("");

    const visibleChildren = children.slice(0, MAX_VISIBLE);
    const hiddenChildren = children.slice(MAX_VISIBLE);

    const renderLink = (name) => {
        if (classLinkMap && classLinkMap.has(name)) {
            return `<a href="${classLinkMap.get(name)}">${name}</a>`;
        }
        return `<span>${name}</span>`;
    };

    let listHtml = `<div class="sb-ref-inherited-by-list">`;
    listHtml += visibleChildren.map(name => `<span class="sb-ref-inherited-by-item">${renderLink(name)}</span>`).join("");

    if (hiddenChildren.length > 0) {
        listHtml += `<details class="sb-ref-inherited-by-more"><summary>and ${hiddenChildren.length} more...</summary>`;
        listHtml += hiddenChildren.map(name => `<span class="sb-ref-inherited-by-item">${renderLink(name)}</span>`).join("");
        listHtml += `</details>`;
    }

    listHtml += `</div>`;
    contentLines.push(listHtml);

    return contentLines;
}

function renderInheritedMembers(inheritedList, classLinkMap, options) {
    if (!inheritedList || inheritedList.length === 0) {
        return [];
    }

    const contentLines = [];
    contentLines.push("", "#### Inherited Members");

    for (let depth = 0; depth < inheritedList.length; depth++) {
        const item = inheritedList[depth];
        const { className, members } = item;
        if (!members || members.length === 0) {
            continue;
        }

        const memberCount = members.length;
        let classLink = className;
        if (classLinkMap && classLinkMap.has(className)) {
            const href = classLinkMap.get(className);
            classLink = `<a href="${href}">${className}</a>`;
        }

        contentLines.push("");
        contentLines.push(`<details class="sb-ref-inherited-details">`);
        contentLines.push(`<summary class="sb-ref-inherited-summary"><span class="sb-ref-inherited-count">${memberCount}</span> inherited from ${classLink}</summary>`);
        contentLines.push(`<div class="sb-ref-inherited-content">`);

        // Group by kind for better organization inside collapsed section
        const groupedByKind = new Map();
        for (const member of members) {
            const kind = member.kind || "property";
            if (!groupedByKind.has(kind)) {
                groupedByKind.set(kind, []);
            }
            groupedByKind.get(kind).push(member);
        }

        for (const kind of SECTION_ORDER) {
            const kindMembers = groupedByKind.get(kind);
            if (!kindMembers || kindMembers.length === 0) {
                continue;
            }

            const label = KIND_LABELS[kind] || kind;
            contentLines.push(`<div class="sb-ref-inherited-group-title">${label}</div>`);
            contentLines.push(`<div class="sb-ref-list">`);

            const icon = getKindIcon(kind);
            for (const member of kindMembers) {
                const name = member.name || "Unnamed";
                const safeName = escapeHtmlText(name);
                let memberLink = name;
                if (classLinkMap && classLinkMap.has(className)) {
                    const href = classLinkMap.get(className);
                    const anchor = sanitizeAnchorId(name);
                    memberLink = `<a class="sb-ref-name" href="${href}#${anchor}">${safeName}</a>`;
                } else {
                    memberLink = `<span class="sb-ref-name">${safeName}</span>`;
                }
                const typeInfo = resolveTypeDisplay(member);
                const typeDisplay = typeInfo.typeDisplay || "";
            const badges = renderTagBadges(member, options);

                let rowClass = "sb-ref-row";
                if (badges.includes("Deprecated")) {
                    rowClass += " sb-ref-row-deprecated";
                }

                let rowHtml = `<div class="${rowClass}">`;
                if (icon) {
                    rowHtml += `<span class="sb-ref-cell-icon">${icon}</span>`;
                }
                rowHtml += `<span class="sb-ref-cell-content">${memberLink}`;
                if (typeDisplay) {
                    const signature = typeDisplay.split("\n")[0].trim();
                    if (signature) {
                        if (signature.includes("->")) {
                            const [params, ...returnTypeParts] = signature.split("->");
                            const returnType = returnTypeParts.join("->").trim();
                            const linkedParams = linkifyTypes(params.trim(), classLinkMap);
                            const linkedReturn = linkifyTypes(returnType, classLinkMap);
                            rowHtml += ` ${linkedParams} <span class="sb-ref-separator">:</span> <span class="sb-ref-type">${linkedReturn}</span>`;
                        } else {
                            const linkedSignature = linkifyTypes(signature, classLinkMap);
                            rowHtml += ` <span class="sb-ref-separator">:</span> <span class="sb-ref-type">${linkedSignature}</span>`;
                        }
                    }
                }
                if (badges) {
                    rowHtml += badges;
                }
                rowHtml += `</span></div>`;
                contentLines.push(rowHtml);
            }
            contentLines.push(`</div>`);
        }

        contentLines.push(`</div></details>`);
    }

    return contentLines;
}


function renderSummarySection(classSymbol, sections, classLinkMap, options) {
    const contentLines = [];

    for (const section of sections) {
        if (!section.entries || section.entries.length === 0) {
            continue;
        }
        const kind = section.kind || "property";
        const icon = getKindIcon(kind);

        contentLines.push("", `#### ${section.label}`);
        contentLines.push("");
        contentLines.push(`<div class="sb-ref-list">`);

        for (const entry of section.entries) {
            const anchor = entry.anchorId ? "#" + entry.anchorId : "";
            const name = entry.symbol.name || entry.symbol.qualifiedName || "Unnamed";
            const safeName = escapeHtmlText(name);
            const typeInfo = resolveTypeDisplay(entry.symbol);
            const typeDisplay = typeInfo.typeDisplay || "";
            const badges = renderTagBadges(entry.symbol, options);

            let rowClass = "sb-ref-row";
            if (badges.includes("Deprecated")) {
                rowClass += " sb-ref-row-deprecated";
            }

            // Build row as single line for MDX compatibility
            let rowHtml = `<div class="${rowClass}">`;
            if (icon) {
                rowHtml += `<span class="sb-ref-cell-icon">${icon}</span>`;
            }
            rowHtml += `<span class="sb-ref-cell-content">`;
            if (anchor) {
                rowHtml += `<a class="sb-ref-name" href="${anchor}">${safeName}</a>`;
            } else {
                rowHtml += `<span class="sb-ref-name">${safeName}</span>`;
            }
            if (typeDisplay) {
                const signature = typeDisplay.split("\n")[0].trim();
                if (signature) {
                    if (signature.includes("->")) {
                        const [params, ...returnTypeParts] = signature.split("->");
                        const returnType = returnTypeParts.join("->").trim();
                        const linkedParams = linkifyTypes(params.trim(), classLinkMap);
                        const linkedReturn = linkifyTypes(returnType, classLinkMap);
                        rowHtml += ` ${linkedParams} <span class="sb-ref-separator">:</span> <span class="sb-ref-type">${linkedReturn}</span>`;
                    } else {
                        const linkedSignature = linkifyTypes(signature, classLinkMap);
                        rowHtml += ` <span class="sb-ref-separator">:</span> <span class="sb-ref-type">${linkedSignature}</span>`;
                    }
                }
            }
            if (badges) {
                rowHtml += badges;
            }
            rowHtml += `</span></div>`;
            contentLines.push(rowHtml);
        }

        contentLines.push("</div>");
    }

    if (contentLines.length === 0) {
        return [];
    }
    return ["## Summary", ...contentLines];
}

function renderClassPage(classSymbol, members, options, classLinkMap, classMap) { // classMap added
    const className = classSymbol.name || "Class";
    const safeClassName = escapeHtmlText(className);
    const classSourceUrl = resolveSourceUrl(classSymbol.location, options && options.source);
    const lines = [
        "---",
        `title: ${className}`,
        `id: ${className}`,
        "---",
    ];
    let heading = safeClassName;
    if (classSourceUrl) {
        const label = (options && options.source && options.source.icon) || DEFAULT_SOURCE_ICON;
        heading = `<span class="sb-ref-heading-row"><span class="sb-ref-heading-text">${safeClassName}</span><a class="sb-ref-source sb-ref-source-inline" href="${classSourceUrl}">${label}</a></span>`;
    }
    lines.push("", `# ${heading}`);

    // 태그 배지 (헤더 바로 아래)
    const classBadges = renderTagBadges(classSymbol, options);
    if (classBadges) {
        lines.push("", `<div class="sb-ref-class-badges">${classBadges}</div>`);
    }

    const body = renderSymbolBody(classSymbol, options, classLinkMap);
    if (body.trim().length > 0) {
        lines.push("", body);
    }

    const usedAnchorIds = new Set();
    const sections = buildClassSections(members || [], usedAnchorIds);

    const summaryLines = renderSummarySection(classSymbol, sections, classLinkMap, options);
    if (summaryLines.length > 0) {
        lines.push("", ...summaryLines);
    }

    const inheritedList = getAllInheritedMembers(classSymbol, classMap);
    const inheritedLines = renderInheritedMembers(inheritedList, classLinkMap, options);
    if (inheritedLines.length > 0) {
        lines.push("", ...inheritedLines);
    }

    for (const section of sections) {
        if (!section.entries || section.entries.length === 0) {
            continue;
        }
        const sectionAnchor = section.anchorId;
        if (sectionAnchor) {
            lines.push("", `## ${section.label} {#${sectionAnchor}}`);
        } else {
            lines.push("", `## ${section.label}`);
        }
        for (const entry of section.entries) {
            lines.push("", renderSymbol(entry.symbol, options, usedAnchorIds, entry.anchorId, entry.symbol.name, classLinkMap));
        }
    }

    const inheritedByLines = renderInheritedBy(className, classMap, classLinkMap);
    if (inheritedByLines.length > 0) {
        lines.push("", ...inheritedByLines);
    }

    return `${lines.join("\n")}\n`;
}

function renderModulePage(moduleData, options) {
    const className = moduleData.name || "Module"; // Changed from classSymbol to moduleData.name
    const safeClassName = escapeHtmlText(className);
    const classSourceUrl = resolveSourceUrl(moduleData.location, options && options.source); // Changed from classSymbol to moduleData
    let classHeading = safeClassName;
    if (classSourceUrl) {
        const label = (options && options.source && options.source.icon) || DEFAULT_SOURCE_ICON;
        classHeading = `<span class="sb-ref-heading-row"><span class="sb-ref-heading-text">${safeClassName}</span><a class="sb-ref-source sb-ref-source-inline" href="${classSourceUrl}">${label}</a></span>`;
    }
    const lines = [
        "---",
        `title: ${className}`,
        "---",
        "",
        `# ${classHeading}`,
    ];

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
    for (const kind of SECTION_ORDER) {
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

function renderOverviewPage(categoryMap, options) {
    const title = (options && options.overviewTitle) || "Overview";
    const lines = [
        "---",
        `title: ${title}`,
        "sidebar_label: Overview",
        "sidebar_position: 1",
        "---",
        "",
        `# ${title}`,
        "",
        "<div className=\"sb-ref-overview\">",
    ];
    const entries = Array.from(categoryMap.entries());
    if (entries.length === 0) {
        lines.push("<p>No classes found.</p>", "</div>");
        return `${lines.join("\n")}\n`;
    }

    const order = (options && Array.isArray(options.categoryOrder)) ? options.categoryOrder : [];
    const groups = new Map();

    for (const [category, items] of entries) {
        const parts = category.split("/").map((part) => part.trim()).filter(Boolean);
        const top = parts.length > 0 ? parts[0] : category;
        const rest = parts.slice(1).join("/");
        if (!groups.has(top)) {
            groups.set(top, new Map());
        }
        const sub = rest || "";
        if (!groups.get(top).has(sub)) {
            groups.get(top).set(sub, []);
        }
        groups.get(top).get(sub).push(...items);
    }

    const topEntries = Array.from(groups.entries());
    topEntries.sort((left, right) => {
        const leftIndex = order.indexOf(left[0]);
        const rightIndex = order.indexOf(right[0]);
        if (leftIndex !== -1 || rightIndex !== -1) {
            if (leftIndex === -1) return 1;
            if (rightIndex === -1) return -1;
            return leftIndex - rightIndex;
        }
        return left[0].localeCompare(right[0]);
    });

    for (const [top, subMap] of topEntries) {
        const flatCount = Array.from(subMap.values()).reduce((acc, list) => acc + list.length, 0);
        lines.push("", '<section className="sb-ref-section">');
        lines.push(`<div className="sb-ref-section-title">${top}</div>`);
        lines.push(`<div className="sb-ref-section-meta">${flatCount} classes</div>`);

        const subEntries = Array.from(subMap.entries());
        subEntries.sort((left, right) => left[0].localeCompare(right[0]));

        for (const [sub, items] of subEntries) {
            const list = items.slice().sort((a, b) => a.id.localeCompare(b.id));
            if (sub) {
                lines.push("", `<div className="sb-ref-subtitle">${sub}</div>`);
            }
            lines.push('<div className="sb-ref-card-grid">');
            for (const entry of list) {
                let link = entry.relativePath.replace(/\\/g, "/").replace(/\.mdx$/, "");
                if (link.endsWith("/index")) {
                    link = link.substring(0, link.length - 5);
                }
                lines.push(`<a className="sb-ref-card" href="${link}">`);
                lines.push(`<div className="sb-ref-card-title">${entry.id}</div>`);
                lines.push('</a>');
            }
            lines.push('</div>');
        }

        lines.push("</section>");
    }

    lines.push("</div>"); // Close sb-ref-overview

    return `${lines.join("\n")}\n`;
}

function buildOutputs(referenceJson, options) {
    const outputs = [];
    const modules = Array.isArray(referenceJson.modules) ? referenceJson.modules : [];

    const classMap = new Map();

    for (const moduleData of modules) {
        const symbols = Array.isArray(moduleData.symbols) ? moduleData.symbols : [];

        for (const symbol of symbols) {
            if (symbol.visibility === "ignored") {
                continue;
            }
            if (symbol.kind === "class" && symbol.name) {
                if (!classMap.has(symbol.name)) {
                    classMap.set(symbol.name, { classSymbol: symbol, members: [] });
                } else if (!classMap.get(symbol.name).classSymbol) {
                    classMap.get(symbol.name).classSymbol = symbol;
                }
            }
        }

        for (const symbol of symbols) {
            if (symbol.kind === "class") {
                continue;
            }

            const within = extractWithin(symbol);
            if (within && classMap.has(within)) {
                classMap.get(within).members.push(symbol);
            }
        }
    }

    const classEntries = [];
    for (const [className, entry] of classMap.entries()) {
        const categories = getSymbolCategories(entry.classSymbol || {});
        const primaryCategory = categories.length > 0 ? categories[0] : "";
        const categoryPath = primaryCategory ? sanitizeCategoryPath(primaryCategory) : "";
        const basePath = categoryPath ? categoryPath : "";
        const relativePath = (basePath ? basePath + "/" : "") + sanitizeModulePath(className) + ".mdx";
        classEntries.push({
            id: className,
            relativePath,
            categories,
            classSymbol: entry.classSymbol || { name: className },
            members: entry.members,
        });
    }

    classEntries.sort((left, right) => left.id.localeCompare(right.id));

    const allCategories = [];
    for (const entry of classEntries) {
        for (const category of entry.categories) {
            if (category && category.trim().length > 0) {
                allCategories.push(category);
            }
        }
    }

    const categoryPaths = collectCategoryPaths(allCategories);

    const defaultCategoryLabel = options.defaultCategory || "Classes";

    const classLinkMap = new Map();
    const processedClassEntries = classEntries.map(entry => {
        const symbol = entry.classSymbol;
        const categories = getSymbolCategories(symbol);
        // User wants @category to determine the root folder.
        const primaryCategory = categories.length > 0 ? categories[0] : defaultCategoryLabel;
        const categoryParts = primaryCategory.split("/").map(p => sanitizeModulePath(p.trim()));

        // Final Path: [CategoryParts...] / [ClassName].mdx
        const pathParts = [...categoryParts, sanitizeModulePath(entry.id)];
        const relativePath = pathParts.join("/") + ".mdx";

        const link = pathParts.join("/");
        classLinkMap.set(entry.id, link);

        return { ...entry, relativePath, categoryParts };
    });

    const folderSet = new Set();
    const createCat = (path, label, docId = null, collapsible = true, collapsed = true) => {
        if (folderSet.has(path)) return;
        folderSet.add(path);

        const meta = {
            label: label,
            collapsible: collapsible,
            collapsed: collapsed,
        };

        if (docId) {
            meta.link = { type: "doc", id: docId };
        }

        outputs.push({
            id: `cat-${path}`,
            relativePath: `${path}/_category_.json`,
            content: JSON.stringify(meta, null, 2) + "\n"
        });
    };

    for (const entry of processedClassEntries) {
        const catParts = entry.categoryParts;
        // 1. Create Category folders
        for (let i = 0; i < catParts.length; i++) {
            const path = catParts.slice(0, i + 1).join("/");
            // Top-level categories are collapsible and collapsed by default
            createCat(path, catParts[i], null, true, true);
        }
    }

    for (const entry of processedClassEntries) {
        outputs.push({
            id: entry.id,
            relativePath: entry.relativePath,
            content: renderClassPage(entry.classSymbol, entry.members, options, classLinkMap, classMap),
        });
    }

    const categoryMap = new Map();
    for (const entry of processedClassEntries) {
        const defaultCategory = options.defaultCategory || "Classes";
        const list = entry.categories.length > 0 ? entry.categories : [defaultCategory];
        for (const category of list) {
            const key = category && category.trim().length > 0 ? category : defaultCategory;
            if (!categoryMap.has(key)) {
                categoryMap.set(key, []);
            }
            categoryMap.get(key).push(entry);
        }
    }

    outputs.push({
        id: "index",
        relativePath: "index.mdx",
        content: renderOverviewPage(categoryMap, options),
    });

    return outputs;
}

function generateReferenceDocs(siteDir, opts = {}, providedContent = null) {
    const options = normalizeOptions(siteDir, opts);
    options.customDocConfig = loadCustomDocConfig(siteDir, options);
    if (options.renderMode !== "mdx") {
        return { written: [], skipped: true };
    }

    const content = providedContent || readJsonFile(options.input);
    if (!content) {
        return { written: [], skipped: true };
    }

    injectCustomTypes(content.data, options);
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
    pruneEmptyDirs(options.outDir);

    const tabSize = typeof options.codeTabSize === "number" ? options.codeTabSize : null;
    if (tabSize) {
        const cssPath = path.join(siteDir, "src", "css", "custom.css");
        ensureDir(path.dirname(cssPath));
        const markerStart = "/* sb-ref-tab-size-start */";
        const markerEnd = "/* sb-ref-tab-size-end */";
        const rule = [
            markerStart,
            ".theme-code-block, pre code {",
            `  tab-size: ${tabSize};`,
            `  -moz-tab-size: ${tabSize};`,
            `  -o-tab-size: ${tabSize};`,
            "}",
            markerEnd,
            "",
        ].join("\n");

        let css = "";
        if (fs.existsSync(cssPath)) {
            css = fs.readFileSync(cssPath, "utf8");
            const regex = /\/\* sb-ref-tab-size-start \*\/[\s\S]*?\/\* sb-ref-tab-size-end \*\//g;
            css = css.replace(regex, "").trimEnd();
            if (css.length > 0 && !css.endsWith("\n")) {
                css += "\n";
            }
        }

        css += rule;
        fs.writeFileSync(cssPath, css, "utf8");
    }

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
