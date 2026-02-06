#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const toml = requireToml();

function requireToml() {
    const bases = [process.cwd(), __dirname, path.join(__dirname, "..")];
    for (const base of bases) {
        try {
            const resolved = require.resolve("toml", { paths: [base] });
            return require(resolved);
        } catch (error) {
            // continue
        }
    }
    return require("toml");
}


const DOCUSAURUS_COMMANDS = new Set([
    "start",
    "build",
    "serve",
    "clear",
    "swizzle",
    "deploy",
    "write-translations",
    "write-heading-ids",
]);

const COMMAND_ALIASES = new Map([["preview", "serve"]]);
const NPM_EXEC_CACHE = { value: null };

function resolveNpmExec() {
    if (NPM_EXEC_CACHE.value) {
        return NPM_EXEC_CACHE.value;
    }

    const npmExecPath = process.env.npm_execpath;
    NPM_EXEC_CACHE.value = resolveNpmCommand();
    return NPM_EXEC_CACHE.value;
}


function resolveNpmCommand() {
    const npmExecPath = process.env.npm_execpath;
    if (npmExecPath && fs.existsSync(npmExecPath)) {
        return { command: process.execPath, args: [npmExecPath] };
    }
    if (process.platform === "win32") {
        return { command: "npm.cmd", args: [] };
    }
    return { command: "npm", args: [] };
}
function sanitizeArgs(args) {
    return args.filter((item) => typeof item === "string" && item.length > 0);
}

function hasNoOpenArg(args) {
    return args.some((arg) => arg === "--no-open" || arg.startsWith("--no-open="));
}

function appendNoOpenArg(args) {
    if (hasNoOpenArg(args)) {
        return args.slice();
    }
    return [...args, "--no-open"];
}



function splitArgs(argv) {
    const index = argv.indexOf("--");
    if (index === -1) {
        return { head: argv.slice(), tail: [] };
    }
    return {
        head: argv.slice(0, index),
        tail: argv.slice(index + 1),
    };
}

function hasConfigFile(dirPath) {
    const candidates = [
        "docusaurus.config.js",
        "docusaurus.config.cjs",
        "docusaurus.config.mjs",
        "docusaurus.config.ts",
        "docusaurus.config.mts",
        "docusaurus.config.cts",
    ];
    return candidates.some((name) => fs.existsSync(path.join(dirPath, name)));
}

function findSingleDocusaurusSiteDir(baseCwd, preferredSegment) {
    const ignoreNames = new Set(["node_modules", ".git", ".docusaurus", "build", "dist", ".generated", ".turbo"]);
    const ignoreSegments = new Set(["tmp", "template"]);
    const queue = [{ dir: baseCwd, depth: 0 }];
    const maxDepth = 4;
    const matches = [];

    while (queue.length > 0) {
        const item = queue.shift();
        if (!item) {
            break;
        }
        const { dir, depth } = item;
        if (hasConfigFile(dir)) {
            matches.push(dir);
            continue;
        }
        if (depth >= maxDepth) {
            continue;
        }
        let entries;
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch (error) {
            continue;
        }
        for (const entry of entries) {
            if (!entry.isDirectory()) {
                continue;
            }
            if (ignoreNames.has(entry.name)) {
                continue;
            }
            queue.push({ dir: path.join(dir, entry.name), depth: depth + 1 });
        }
    }

    const shouldIgnore = (candidate) => {
        const parts = path.normalize(candidate).split(path.sep);
        for (const part of parts) {
            if (ignoreSegments.has(part)) {
                return true;
            }
        }
        return false;
    };

    let candidates = matches.filter((candidate) => !shouldIgnore(candidate));
    if (preferredSegment) {
        const preferred = candidates.filter((candidate) => path.normalize(candidate).split(path.sep).includes(preferredSegment));
        if (preferred.length > 0) {
            candidates = preferred;
        }
    }

    if (candidates.length === 1) {
        return candidates[0];
    }
    if (candidates.length > 1) {
        candidates.sort((a, b) => a.length - b.length);
        return candidates[0];
    }
    if (matches.length === 1) {
        return matches[0];
    }
    if (matches.length > 1) {
        matches.sort((a, b) => a.length - b.length);
        return matches[0];
    }
    return null;
}


function parseGlobalArgs(argv) {
    const args = argv.slice();
    let cwd = process.cwd();
    let siteDir = null;
    let configPath = null;

    const rest = [];
    for (let i = 0; i < args.length; i += 1) {
        const arg = args[i];
        if (arg === "--cwd" && args[i + 1]) {
            cwd = path.resolve(args[i + 1]);
            i += 1;
            continue;
        }
        if ((arg === "--site-dir" || arg === "--siteDir") && args[i + 1]) {
            siteDir = args[i + 1];
            i += 1;
            continue;
        }
        if (arg === "--config" && args[i + 1]) {
            configPath = args[i + 1];
            i += 1;
            continue;
        }
        rest.push(arg);
    }

    if (!siteDir) {
        siteDir = hasConfigFile(cwd) ? "." : "website";
    }

    const resolvedConfigPath = configPath ? path.resolve(cwd, configPath) : null;

    return {
        cwd,
        siteDir,
        configPath: resolvedConfigPath,
        rest,
    };
}

function parseDevArgs(argv) {
    const args = [];
    let restart = true;
    let watchCli = false;

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        if (arg === "--no-restart") {
            restart = false;
            continue;
        }
        if (arg === "--restart") {
            restart = true;
            continue;
        }
        if (arg === "--dev-watch-cli") {
            watchCli = true;
            continue;
        }
        args.push(arg);
    }

    return {
        args,
        restart,
        watchCli,
    };
}


function resolveSiteDir(baseCwd, siteDir) {
    const resolved = path.resolve(baseCwd, siteDir || ".");
    if (hasConfigFile(resolved)) {
        return resolved;
    }
    const detected = findSingleDocusaurusSiteDir(baseCwd, path.basename(resolved));
    if (detected) {
        console.log("[bakerywave] resolved site dir: " + detected);
        return detected;
    }
    return resolved;
}

function resolveCommand(command) {
    return COMMAND_ALIASES.get(command) || command;
}

function runInit(baseCwd, initArgs) {
    const hasArg = (value) => initArgs.includes(value);
    const argsWithLocal = () => {
        const args = initArgs.slice();
        if (!hasArg("--local")) {
            args.push("--local");
        }
        if (!hasArg("--workspace-root")) {
            args.push("--workspace-root", baseCwd);
        }
        return args;
    };

    const localCreateDocs = path.resolve(baseCwd, "packages", "create-docs", "bin", "create-docs.js");
    if (fs.existsSync(localCreateDocs)) {
        console.log("[bakerywave] init using local template.");
        const localResult = spawnSync(process.execPath, [localCreateDocs, ...argsWithLocal()], {
            stdio: "inherit",
            cwd: baseCwd,
        });
        if (localResult.status === 0) {
            return;
        }
        if (localResult.status !== null) {
            process.exit(localResult.status);
        }
        process.exit(1);
    }

    const npmExec = resolveNpmCommand();
    const args = sanitizeArgs([...npmExec.args, "create", "@storybakery/docs", ...initArgs]);
    let result;
    try {
        result = spawnSync(npmExec.command, args, {
            stdio: "inherit",
            cwd: baseCwd,
        });
    } catch (error) {
        result = { status: 1, error };
    }

    if (result && result.status === 0) {
        return;
    }

    const fallbackCreateDocs = path.resolve(__dirname, "..", "..", "create-docs", "bin", "create-docs.js");
    if (!fs.existsSync(fallbackCreateDocs)) {
        if (result && result.error) {
            console.error("[bakerywave] init failed: " + result.error.message);
        }
        process.exit(result && result.status !== null ? result.status : 1);
    }

    console.warn("[bakerywave] npm create failed. Falling back to local template.");
    const fallback = spawnSync(process.execPath, [fallbackCreateDocs, ...argsWithLocal()], {
        stdio: "inherit",
        cwd: baseCwd,
    });

    if (fallback.status !== 0) {
        process.exit(fallback.status === null ? 1 : fallback.status);
    }
}

function runCommand(command, args, options) {
    const result = spawnSync(command, sanitizeArgs(args), {
        stdio: "inherit",
        cwd: options.cwd,
        env: options.env || process.env,
    });
    if (result.error) {
        console.error(`[bakerywave] failed to execute command: ${command}`);
        console.error(result.error.message);
    }
    if (result.status !== null) {
        process.exit(result.status);
    }
    process.exit(1);
}

function runDocusaurus(command, args, siteDirAbs) {
    if (!fs.existsSync(siteDirAbs)) {
        console.error(`[bakerywave] site directory not found: ${siteDirAbs}`);
        process.exit(1);
    }
    let npmExec = resolveNpmExec();
    const cmdArgs = sanitizeArgs([...npmExec.args, "exec", "docusaurus", "--", command, ...args]);
    try {
        const versionCheck = spawnSync(npmExec.command, ["--version"], { stdio: "ignore" });
        if (versionCheck.error || versionCheck.status !== 0) {
            npmExec = resolveNpmCommand();
        }
    } catch (error) {
        npmExec = resolveNpmCommand();
    }
    try {
        runCommand(npmExec.command, cmdArgs, {
            cwd: siteDirAbs,
        });
        return;
    } catch (error) {
        const docusaurusBin = require.resolve("@docusaurus/core/bin/docusaurus.mjs", { paths: [siteDirAbs, __dirname] });
        runCommand(process.execPath, [docusaurusBin, command, ...args], {
            cwd: siteDirAbs,
        });
    }
}

function spawnDocusaurus(command, args, siteDirAbs) {
    if (!fs.existsSync(siteDirAbs)) {
        console.error(`[bakerywave] site directory not found: ${siteDirAbs}`);
        process.exit(1);
    }
    let npmExec = resolveNpmExec();
    const cmdArgs = sanitizeArgs([...npmExec.args, "exec", "docusaurus", "--", command, ...args]);
    try {
        const versionCheck = spawnSync(npmExec.command, ["--version"], { stdio: "ignore" });
        if (versionCheck.error || versionCheck.status !== 0) {
            npmExec = resolveNpmCommand();
        }
    } catch (error) {
        npmExec = resolveNpmCommand();
    }
    try {
        return spawn(npmExec.command, cmdArgs, {
            stdio: "inherit",
            cwd: siteDirAbs,
            env: process.env,
            detached: process.platform !== "win32",
        });
    } catch (error) {
        const docusaurusBin = require.resolve("@docusaurus/core/bin/docusaurus.mjs", { paths: [siteDirAbs, __dirname] });
        return spawn(process.execPath, [docusaurusBin, command, ...args], {
            stdio: "inherit",
            cwd: siteDirAbs,
            env: process.env,
            detached: process.platform !== "win32",
        });
    }
}


function findPresetOptions(siteConfig) {
    const presets = Array.isArray(siteConfig.presets) ? siteConfig.presets : [];
    for (const preset of presets) {
        if (!Array.isArray(preset)) {
            continue;
        }
        const [name, options] = preset;
        if (name === "@storybakery/docs-preset" && options && typeof options === "object") {
            return options;
        }
    }
    return null;
}

function resolveProjectRoot(baseCwd, siteDirAbs) {
    if (path.basename(siteDirAbs) === "website") {
        return path.resolve(siteDirAbs, "..");
    }
    return baseCwd;
}

function hasWorkspacePackages(dirPath) {
    const packagesDir = path.join(dirPath, "packages");
    if (!fs.existsSync(packagesDir)) {
        return false;
    }
    const required = [
        path.join(packagesDir, "docs-preset"),
        path.join(packagesDir, "docs-theme"),
        path.join(packagesDir, "docusaurus-plugin-reference"),
        path.join(packagesDir, "luau-docgen"),
    ];
    return required.every((entry) => fs.existsSync(entry));
}

function findWorkspaceRoot(baseCwd, siteDirAbs) {
    const candidates = [
        resolveProjectRoot(baseCwd, siteDirAbs),
        baseCwd,
        path.resolve(baseCwd, ".."),
    ];
    for (const candidate of candidates) {
        if (candidate && hasWorkspacePackages(candidate)) {
            return candidate;
        }
    }

    let current = baseCwd;
    while (current && current !== path.dirname(current)) {
        if (hasWorkspacePackages(current)) {
            return current;
        }
        current = path.dirname(current);
    }
    return resolveProjectRoot(baseCwd, siteDirAbs);
}

function findBakerywaveTomlPath(baseCwd, siteDirAbs) {
    const projectRoot = resolveProjectRoot(baseCwd, siteDirAbs);
    const candidates = [
        path.join(siteDirAbs, "bakerywave.toml"),
        path.join(projectRoot, "bakerywave.toml"),
    ];

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }

    return null;
}

function resolveTomlPathOptions(tomlPath, options) {
    const resolved = { ...options };
    const baseDir = path.dirname(tomlPath);
    const pathKeys = ["rootDir", "input", "outDir", "manifestPath", "customDocConfig"];

    for (const key of pathKeys) {
        const value = resolved[key];
        if (!value || path.isAbsolute(value)) {
            continue;
        }
        resolved[key] = path.resolve(baseDir, value);
    }

    return resolved;
}

function loadBakerywaveReferenceOptions(baseCwd, siteDirAbs) {
    const tomlPath = findBakerywaveTomlPath(baseCwd, siteDirAbs);
    if (!tomlPath) {
        return {};
    }

    try {
        const raw = fs.readFileSync(tomlPath, "utf8");
        const parsed = toml.parse(raw);
        const reference = parsed.reference && typeof parsed.reference === "object" ? parsed.reference : {};
        return resolveTomlPathOptions(tomlPath, reference);
    } catch (error) {
        console.error(`[bakerywave] failed to load bakerywave.toml: ${tomlPath}`);
        console.error(error.message);
        return {};
    }
}


function loadBakerywaveI18nOptions(baseCwd, siteDirAbs) {
    const tomlPath = findBakerywaveTomlPath(baseCwd, siteDirAbs);
    if (!tomlPath) {
        return {};
    }

    try {
        const raw = fs.readFileSync(tomlPath, "utf8");
        const parsed = toml.parse(raw);
        const i18n = parsed.i18n && typeof parsed.i18n === "object" ? parsed.i18n : {};
        return { ...i18n };
    } catch (error) {
        console.error(`[bakerywave] failed to load bakerywave.toml: ${tomlPath}`);
        console.error(error.message);
        return {};
    }
}

function loadI18nOptions(baseCwd, siteDirAbs, configPath) {
    const configFile = configPath
        ? path.resolve(baseCwd, configPath)
        : path.join(siteDirAbs, "docusaurus.config.js");
    const bakerywaveOptions = loadBakerywaveI18nOptions(baseCwd, siteDirAbs);

    if (!fs.existsSync(configFile)) {
        return { ...bakerywaveOptions };
    }

    try {
        delete require.cache[require.resolve(configFile)];
        const siteConfig = require(configFile);
        const i18n = siteConfig && siteConfig.i18n && typeof siteConfig.i18n === "object" ? siteConfig.i18n : {};
        return {
            ...i18n,
            ...bakerywaveOptions,
        };
    } catch (error) {
        console.error(`[bakerywave] failed to load config: ${configFile}`);
        console.error(error.message);
        return { ...bakerywaveOptions };
    }
}
function loadReferenceOptions(baseCwd, siteDirAbs, configPath) {
    const configFile = configPath
        ? path.resolve(baseCwd, configPath)
        : path.join(siteDirAbs, "docusaurus.config.js");
    const bakerywaveOptions = loadBakerywaveReferenceOptions(baseCwd, siteDirAbs);

    if (!fs.existsSync(configFile)) {
        return { ...bakerywaveOptions };
    }

    try {
        delete require.cache[require.resolve(configFile)];
        const siteConfig = require(configFile);
        const presetOptions = findPresetOptions(siteConfig);
        if (!presetOptions) {
            return { ...bakerywaveOptions };
        }

        const presetReference =
            presetOptions.reference && typeof presetOptions.reference === "object"
                ? { ...presetOptions.reference }
                : {};

        return {
            ...presetReference,
            ...bakerywaveOptions,
        };
    } catch (error) {
        console.error(`[bakerywave] failed to load config: ${configFile}`);
        console.error(error.message);
        return { ...bakerywaveOptions };
    }
}

function resolveModule(request, searchPaths, fallbackPath) {
    try {
        const resolved = require.resolve(request, { paths: searchPaths });
        return require(resolved);
    } catch (error) {
        if (fallbackPath && fs.existsSync(fallbackPath)) {
            return require(fallbackPath);
        }
        throw error;
    }
}

function resolveDocgenScript(searchPaths) {
    const fallbackPath = path.resolve(__dirname, "..", "..", "luau-docgen", "bin", "luau-docgen.js");
    try {
        return require.resolve("@storybakery/luau-docgen/bin/luau-docgen.js", { paths: searchPaths });
    } catch (error) {
        if (fs.existsSync(fallbackPath)) {
            return fallbackPath;
        }
        throw error;
    }
}

function resolveReferenceGenerator(searchPaths) {
    const fallbackPath = path.resolve(
        __dirname,
        "..",
        "..",
        "docusaurus-plugin-reference",
        "generate.js"
    );
    return resolveModule("@storybakery/docusaurus-plugin-reference/generate", searchPaths, fallbackPath);
}

function parseReferenceArgs(args) {
    const options = {
        enabled: null,
        lang: null,
        rootDir: null,
        srcDir: null,
        typesDir: null,
        input: null,
        outDir: null,
        manifestPath: null,
        includePrivate: null,
        clean: null,
        renderMode: null,
        failOnWarning: false,
        legacy: false,
    };

    const rest = [];
    for (let i = 0; i < args.length; i += 1) {
        const arg = args[i];
        if (arg === "--lang" && args[i + 1]) {
            options.lang = args[i + 1];
            i += 1;
            continue;
        }
        if (arg === "--no-reference") {
            options.enabled = false;
            continue;
        }
        if (arg === "--root" && args[i + 1]) {
            options.rootDir = args[i + 1];
            i += 1;
            continue;
        }
        if (arg === "--src" && args[i + 1]) {
            options.srcDir = args[i + 1];
            i += 1;
            continue;
        }
        if (arg === "--types" && args[i + 1]) {
            options.typesDir = args[i + 1];
            i += 1;
            continue;
        }
        if (arg === "--input" && args[i + 1]) {
            options.input = args[i + 1];
            i += 1;
            continue;
        }
        if (arg === "--out-dir" && args[i + 1]) {
            options.outDir = args[i + 1];
            i += 1;
            continue;
        }
        if (arg === "--manifest" && args[i + 1]) {
            options.manifestPath = args[i + 1];
            i += 1;
            continue;
        }
        if (arg === "--include-private") {
            options.includePrivate = true;
            continue;
        }
        if (arg === "--no-clean") {
            options.clean = false;
            continue;
        }
        if (arg === "--render-mode" && args[i + 1]) {
            options.renderMode = args[i + 1];
            i += 1;
            continue;
        }
        if (arg === "--fail-on-warning") {
            options.failOnWarning = true;
            continue;
        }
        if (arg === "--legacy") {
            options.legacy = true;
            continue;
        }
        rest.push(arg);
    }

    return { options, rest };
}


function resolveReferenceLanguageOptions(referenceOptions, overrides) {
    const options = { ...referenceOptions };
    const languages = options.languages && typeof options.languages === "object" ? options.languages : null;
    const selectedLang = (overrides && overrides.lang) || options.lang || null;
    const defaultLang = selectedLang || (languages ? Object.keys(languages)[0] : null) || "luau";
    options.lang = defaultLang;

    if (languages && languages[defaultLang] && typeof languages[defaultLang] === "object") {
        const langOptions = languages[defaultLang];
        return { ...options, ...langOptions, lang: defaultLang };
    }

    return options;
}
function resolveReferenceOptions(baseOptions, overrides) {
    const merged = { ...baseOptions };
    const keys = [
        "enabled",
        "lang",
        "rootDir",
        "srcDir",
        "typesDir",
        "input",
        "outDir",
        "manifestPath",
        "customDocConfig",
        "includePrivate",
        "clean",
        "renderMode",
    ];
    for (const key of keys) {
        const value = overrides[key];
        if (value === null || value === undefined) {
            continue;
        }
        merged[key] = value;
    }

    return resolveReferenceLanguageOptions(merged, overrides);
}

function resolveReferenceDefaults(baseCwd, siteDirAbs, referenceOptions) {
    const lang = referenceOptions.lang || "luau";
    let rootDir = null;
    if (referenceOptions.rootDir) {
        rootDir = path.resolve(baseCwd, referenceOptions.rootDir);
    } else if (path.basename(siteDirAbs) === "website") {
        rootDir = path.resolve(siteDirAbs, "..");
    } else {
        rootDir = path.resolve(baseCwd, ".");
    }
    const srcDir = referenceOptions.srcDir || "src";
    const typesDir = referenceOptions.typesDir || null;
    const input =
        referenceOptions.input || path.join(siteDirAbs, ".generated", "reference", `${lang}.json`);

    return {
        lang,
        rootDir,
        srcDir,
        typesDir,
        input,
    };
}

function runLuauDocgen(docgenScript, defaults, docgenFlags) {
    // 1. Try to find native binary next to the executable (for packaged release)
    const binaryName = process.platform === "win32" ? "luau-docgen.exe" : "luau-docgen";
    const binaryPath = path.join(path.dirname(process.execPath), binaryName);

    if (fs.existsSync(binaryPath)) {
        const args = ["--root", defaults.rootDir, "--src", defaults.srcDir, "--out", defaults.input];

        if (defaults.typesDir) {
            args.push("--types", defaults.typesDir);
        }
        if (docgenFlags.failOnWarning) {
            args.push("--fail-on-warning");
        }

        // Native binary doesn't support --legacy flag as it IS the native implementation
        // pass generator version if needed, but we might not have pkg version here easily if we are outside.
        // However, the native binary might not strictly require it for basic functionality.

        const result = spawnSync(binaryPath, args, {
            stdio: "inherit",
            cwd: defaults.rootDir,
        });

        if (result.status !== 0) {
            process.exit(result.status || 1);
        }

        if (!fs.existsSync(defaults.input)) {
            console.error(`[bakerywave] reference JSON not found: ${defaults.input}`);
            process.exit(1);
        }
        return;
    }

    // 2. Fallback to Node.js script
    if (!fs.existsSync(docgenScript)) {
        console.error(`[bakerywave] luau-docgen script not found: ${docgenScript}`);
        process.exit(1);
    }

    const args = [
        docgenScript,
        "--root",
        defaults.rootDir,
        "--src",
        defaults.srcDir,
        "--out",
        defaults.input,
    ];

    if (defaults.typesDir) {
        args.push("--types", defaults.typesDir);
    }
    if (docgenFlags.failOnWarning) {
        args.push("--fail-on-warning");
    }
    if (docgenFlags.legacy) {
        args.push("--legacy");
    }

    const result = spawnSync(process.execPath, args, {
        stdio: "inherit",
        cwd: defaults.rootDir,
    });
    if (result.error) {
        console.error(`[bakerywave] failed to run luau-docgen: ${result.error.message}`);
        process.exit(1);
    }
    if (result.status !== 0) {
        process.exit(result.status || 1);
    }

    if (!fs.existsSync(defaults.input)) {
        console.error(`[bakerywave] reference JSON not found: ${defaults.input}`);
        process.exit(1);
    }
}

function runReferenceBuild(docgenScript, generator, baseCwd, siteDirAbs, referenceOptions, docgenFlags, configPath) {
    if (referenceOptions.enabled === false) {
        console.log("[bakerywave] reference disabled.");
        return;
    }
    const defaults = resolveReferenceDefaults(baseCwd, siteDirAbs, referenceOptions);
    runLuauDocgen(docgenScript, defaults, docgenFlags);

    const generatorOptions = {
        ...referenceOptions,
        lang: defaults.lang,
        input: defaults.input,
    };

    const result = generator.generateReferenceDocs(siteDirAbs, generatorOptions);
    if (result.skipped) {
        console.warn("[bakerywave] reference generation skipped.");
        return;
    }

    const i18nOptions = loadI18nOptions(baseCwd, siteDirAbs, configPath);
    if (generatorOptions.renderMode !== "json") {
        syncReferenceI18n(siteDirAbs, result.outDir, defaults.lang, i18nOptions);
    }

    console.log(`[bakerywave] reference generated: ${result.outDir}`);
}


function resolveI18nDefaults(i18nOptions) {
    const locales = Array.isArray(i18nOptions.locales) ? i18nOptions.locales : [];
    const defaultLocale = i18nOptions.defaultLocale || locales[0] || null;
    let referenceLocales = Array.isArray(i18nOptions.referenceLocales) ? i18nOptions.referenceLocales : [];
    if (referenceLocales.length === 0 && defaultLocale) {
        referenceLocales = locales.filter((locale) => locale !== defaultLocale);
    }
    const referenceCopy = !i18nOptions.reference || i18nOptions.reference.copy !== false;
    return {
        locales,
        defaultLocale,
        referenceLocales,
        referenceCopy,
    };
}

function copyDirSync(source, target) {
    if (!fs.existsSync(source)) {
        return;
    }
    fs.mkdirSync(target, { recursive: true });
    const entries = fs.readdirSync(source, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(source, entry.name);
        const dstPath = path.join(target, entry.name);
        if (entry.isDirectory()) {
            copyDirSync(srcPath, dstPath);
            continue;
        }
        fs.copyFileSync(srcPath, dstPath);
    }
}

function syncReferenceI18n(siteDirAbs, outDir, lang, i18nOptions) {
    const defaults = resolveI18nDefaults(i18nOptions);
    if (!defaults.defaultLocale || defaults.referenceLocales.length === 0 || !defaults.referenceCopy) {
        return;
    }

    const docsRoot = path.join(siteDirAbs, "i18n");
    for (const locale of defaults.referenceLocales) {
        const target = path.join(
            docsRoot,
            locale,
            "docusaurus-plugin-content-docs",
            "current",
            "reference",
            lang
        );
        try {
            fs.rmSync(target, { recursive: true, force: true });
        } catch (error) {
            if (!error || (error.code !== "EPERM" && error.code !== "EBUSY")) {
                throw error;
            }
            console.warn(`[bakerywave] i18n cleanup skipped (locked): ${target}`);
        }
        copyDirSync(outDir, target);
    }
}
function createWatchers(targets, onChange) {
    const watchers = [];
    for (const target of targets) {
        if (!fs.existsSync(target)) {
            continue;
        }
        try {
            const watcher = fs.watch(target, { recursive: true }, onChange);
            watcher.on("error", (error) => {
                console.warn(`[bakerywave] watch error (${target}): ${error.message}`);
            });
            watchers.push(watcher);
            continue;
        } catch (error) {
            const watcher = fs.watch(target, onChange);
            watcher.on("error", (watchError) => {
                console.warn(`[bakerywave] watch error (${target}): ${watchError.message}`);
            });
            watchers.push(watcher);
        }
    }
    return watchers;
}

function shouldTrackFileForMode(filePath, mode) {
    if (mode !== "reference") {
        return true;
    }
    const ext = path.extname(filePath).toLowerCase();
    return ext === ".luau" || ext === ".lua" || ext === ".json" || ext === ".toml";
}

function collectFingerprintFiles(target, output, mode) {
    if (!fs.existsSync(target)) {
        return;
    }
    const stat = fs.statSync(target);
    if (stat.isDirectory()) {
        const entries = fs.readdirSync(target, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name.startsWith(".") || entry.name === "node_modules") {
                continue;
            }
            collectFingerprintFiles(path.join(target, entry.name), output, mode);
        }
        return;
    }
    if (stat.isFile() && shouldTrackFileForMode(target, mode)) {
        output.push({ path: target, size: stat.size, mtimeMs: Math.trunc(stat.mtimeMs) });
    }
}

function buildTargetsFingerprint(targets, mode = "generic") {
    const records = [];
    for (const target of targets) {
        collectFingerprintFiles(target, records, mode);
    }
    records.sort((left, right) => left.path.localeCompare(right.path));
    return records
        .map((record) => `${record.path.replace(/\\/g, "/")}|${record.size}|${record.mtimeMs}`)
        .join("\n");
}

function collectJsonFiles(dirPath, output) {
    if (!fs.existsSync(dirPath)) {
        return;
    }
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            collectJsonFiles(fullPath, output);
            continue;
        }
        if (entry.isFile() && entry.name.endsWith(".json")) {
            output.push(fullPath);
        }
    }
}

function isStaleDocSource(siteDirAbs, source) {
    if (!source || typeof source !== "string" || !source.startsWith("@site/")) {
        return false;
    }
    const rel = source.replace(/^@site\//, "");
    const abs = path.join(siteDirAbs, rel);
    return !fs.existsSync(abs);
}

function cleanupDocusaurusCacheIfStale(siteDirAbs) {
    const cacheRoot = path.join(siteDirAbs, ".docusaurus");
    const docsCache = path.join(cacheRoot, "docusaurus-plugin-content-docs");
    if (!fs.existsSync(docsCache)) {
        return;
    }
    const files = [];
    collectJsonFiles(docsCache, files);
    for (const filePath of files) {
        let raw;
        try {
            raw = fs.readFileSync(filePath, "utf8");
        } catch (error) {
            continue;
        }
        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (error) {
            continue;
        }
        if (parsed && isStaleDocSource(siteDirAbs, parsed.source)) {
            try {
                fs.rmSync(cacheRoot, { recursive: true, force: true });
                console.warn(`[bakerywave] cleared stale docusaurus cache: ${cacheRoot}`);
            } catch (error) {
                console.warn(`[bakerywave] failed to clear stale cache: ${cacheRoot}`);
            }
            return;
        }
    }
}

function killProcessTree(child, signal) {
    if (!child || !child.pid || child.exitCode !== null) {
        return;
    }
    if (process.platform === "win32") {
        try {
            spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
            return;
        } catch (error) {
            // fall through
        }
    }
    try {
        process.kill(-child.pid, signal);
    } catch (error) {
        try {
            child.kill(signal);
        } catch (innerError) {
            // ignore
        }
    }
}

function ensureProcessExit(child, delayMs) {
    if (!child || !child.pid || process.platform === "win32") {
        return;
    }
    const pid = child.pid;
    setTimeout(() => {
        if (!child || child.pid !== pid || child.exitCode !== null) {
            return;
        }
        killProcessTree(child, "SIGKILL");
    }, delayMs);
}

function runReferenceWatch(docgenScript, generator, baseCwd, siteDirAbs, referenceOptions, docgenFlags, configPath) {
    if (referenceOptions.enabled === false) {
        console.log("[bakerywave] reference disabled.");
        return;
    }
    const defaults = resolveReferenceDefaults(baseCwd, siteDirAbs, referenceOptions);
    const watchTargets = [path.join(defaults.rootDir, defaults.srcDir)];
    if (defaults.typesDir) {
        watchTargets.push(path.join(defaults.rootDir, defaults.typesDir));
    }
    if (typeof referenceOptions.customDocConfig === "string" && referenceOptions.customDocConfig.length > 0) {
        watchTargets.push(referenceOptions.customDocConfig);
    }

    let running = false;
    let pending = false;
    let watchFingerprint = buildTargetsFingerprint(watchTargets, "reference");
    let watchChangeTimer = null;

    const trigger = () => {
        if (running) {
            pending = true;
            return;
        }
        running = true;
        pending = false;
        try {
            runReferenceBuild(docgenScript, generator, baseCwd, siteDirAbs, referenceOptions, docgenFlags, configPath);
        } finally {
            running = false;
            if (pending) {
                trigger();
            }
        }
    };

    trigger();

    const watchers = createWatchers(watchTargets, () => {
        if (watchChangeTimer) {
            clearTimeout(watchChangeTimer);
        }
        watchChangeTimer = setTimeout(() => {
            const nextFingerprint = buildTargetsFingerprint(watchTargets, "reference");
            if (nextFingerprint === watchFingerprint) {
                return;
            }
            watchFingerprint = nextFingerprint;
            trigger();
        }, 80);
    });

    if (watchers.length === 0) {
        console.warn("[bakerywave] no watch targets found. skipping reference watch.");
        return;
    }

    console.log("[bakerywave] watching reference sources...");
}

function buildReferenceWatchArgs(siteDirAbs, configPath) {
    const args = ["reference", "watch", "--site-dir", siteDirAbs];
    if (configPath) {
        args.push("--config", configPath);
    }
    return args;
}

function buildReferenceWatchTargets(baseCwd, siteDirAbs, referenceOptions) {
    const defaults = resolveReferenceDefaults(baseCwd, siteDirAbs, referenceOptions);
    const targets = [path.join(defaults.rootDir, defaults.srcDir)];
    if (defaults.typesDir) {
        targets.push(path.join(defaults.rootDir, defaults.typesDir));
    }
    if (typeof referenceOptions.customDocConfig === "string" && referenceOptions.customDocConfig.length > 0) {
        targets.push(referenceOptions.customDocConfig);
    }
    return targets.filter((target) => fs.existsSync(target));
}

function buildRestartTargets(baseCwd, siteDirAbs, configPath) {
    const targets = [];
    const projectRoot = findWorkspaceRoot(baseCwd, siteDirAbs);

    const packageDirs = [
        path.join(projectRoot, "packages", "docs-preset"),
        path.join(projectRoot, "packages", "docs-theme"),
        path.join(projectRoot, "packages", "docusaurus-plugin-reference"),
        path.join(projectRoot, "packages", "luau-docgen"),
    ];

    for (const dir of packageDirs) {
        if (fs.existsSync(dir)) {
            targets.push(dir);
        }
    }

    const configCandidates = configPath
        ? [path.resolve(baseCwd, configPath)]
        : [
            path.join(siteDirAbs, "docusaurus.config.js"),
            path.join(siteDirAbs, "docusaurus.config.cjs"),
            path.join(siteDirAbs, "docusaurus.config.mjs"),
            path.join(siteDirAbs, "docusaurus.config.ts"),
        ];

    for (const candidate of configCandidates) {
        if (fs.existsSync(candidate)) {
            targets.push(candidate);
        }
    }

    const tomlCandidates = [
        path.join(siteDirAbs, "bakerywave.toml"),
        path.join(projectRoot, "bakerywave.toml"),
    ];

    for (const candidate of tomlCandidates) {
        if (fs.existsSync(candidate)) {
            targets.push(candidate);
        }
    }

    return targets;
}

function buildCliRestartTargets(baseCwd, siteDirAbs) {
    const targets = [];
    const projectRoot = findWorkspaceRoot(baseCwd, siteDirAbs);
    const cliDir = path.join(projectRoot, "packages", "bakerywave");
    if (fs.existsSync(cliDir)) {
        targets.push(cliDir);
    }
    return targets;
}


function runDev(baseCwd, siteDirAbs, configPath, docusaurusArgs, devOptions) {
    const loadedReferenceOptions = loadReferenceOptions(baseCwd, siteDirAbs, configPath);
    const referenceOptions = resolveReferenceOptions(loadedReferenceOptions, {});
    const watchArgs = buildReferenceWatchArgs(siteDirAbs, configPath);
    let watchProcess = null;
    if (referenceOptions.enabled === false) {
        console.log("[bakerywave] reference disabled. skipping watch.");
    } else if (buildReferenceWatchTargets(baseCwd, siteDirAbs, referenceOptions).length === 0) {
        console.warn("[bakerywave] reference watch targets missing. skipping watch.");
    } else {
        watchProcess = spawn(process.execPath, [__filename, ...watchArgs], {
            stdio: "inherit",
            cwd: baseCwd,
            env: process.env,
            detached: process.platform !== "win32",
        });
    }

    const restartEnabled = !(devOptions && devOptions.restart === false);
    const restartTargets = restartEnabled
        ? buildRestartTargets(baseCwd, siteDirAbs, configPath)
        : [];
    const cliRestartTargets = devOptions && devOptions.watchCli ? buildCliRestartTargets(baseCwd, siteDirAbs) : [];
    const restartNoOpen = process.env.BAKERYWAVE_DEV_NO_OPEN === "1";
    const startArgs = restartNoOpen ? appendNoOpenArg(docusaurusArgs) : docusaurusArgs.slice();
    const restartArgs = appendNoOpenArg(docusaurusArgs);
    cleanupDocusaurusCacheIfStale(siteDirAbs);
    let startProcess = spawnDocusaurus("start", startArgs, siteDirAbs);
    const children = watchProcess ? [watchProcess, startProcess] : [startProcess];
    const watchIndex = watchProcess ? 0 : -1;
    const startIndex = watchProcess ? 1 : 0;
    let restartFingerprint = buildTargetsFingerprint(restartTargets, "generic");
    let restartWatchTimer = null;
    const restartWatchers = restartTargets.length > 0
        ? createWatchers(restartTargets, () => {
            if (restartWatchTimer) {
                clearTimeout(restartWatchTimer);
            }
            restartWatchTimer = setTimeout(() => {
                const nextFingerprint = buildTargetsFingerprint(restartTargets, "generic");
                if (nextFingerprint === restartFingerprint) {
                    return;
                }
                restartFingerprint = nextFingerprint;
                console.log("[bakerywave] restart targets changed. restarting dev server...");
                scheduleRestart();
            }, 120);
        })
        : [];
    let cliWatchReady = false;
    let cliFingerprint = buildTargetsFingerprint(cliRestartTargets, "generic");
    let cliWatchTimer = null;
    const cliRestartWatchers = cliRestartTargets.length > 0
        ? createWatchers(cliRestartTargets, () => {
            if (cliWatchTimer) {
                clearTimeout(cliWatchTimer);
            }
            cliWatchTimer = setTimeout(() => {
                const nextFingerprint = buildTargetsFingerprint(cliRestartTargets, "generic");
                if (nextFingerprint === cliFingerprint) {
                    return;
                }
                cliFingerprint = nextFingerprint;
                console.log("[bakerywave] cli source changed. restarting bakerywave dev...");
                scheduleCliRestart();
            }, 120);
        })
        : [];
    let exiting = false;
    let restartTimer = null;
    const ignoredExitPids = new Set();
    let cliRestartTimer = null;
    let restartingSelf = false;

    let restartingStart = false;
    let restartingWatch = false;
    let pendingRestart = false;
    let lastStartExit = 0;
    let startExitStreak = 0;
    let pendingWatchRespawn = false;

    const attachExitHandler = (child, role) => {
        if (!child) {
            return;
        }
        child.__bwRole = role;
        child.on("exit", (nextCode) => handleChildExit(child, nextCode));
    };

    const spawnStart = () => {
        if (startProcess && startProcess.exitCode === null) {
            return;
        }
        cleanupDocusaurusCacheIfStale(siteDirAbs);
        startProcess = spawnDocusaurus("start", restartArgs, siteDirAbs);
        children[startIndex] = startProcess;
        attachExitHandler(startProcess, "start");
    };

    const respawnWatch = () => {
        if (exiting || !watchProcess) {
            return;
        }
        if (restartingWatch) {
            return;
        }
        restartingWatch = true;
        setTimeout(() => {
            restartingWatch = false;
            if (exiting) {
                return;
            }
            watchProcess = spawn(process.execPath, [__filename, ...watchArgs], {
                stdio: "inherit",
                cwd: baseCwd,
                env: process.env,
                detached: process.platform !== "win32",
            });
            children[watchIndex] = watchProcess;
            attachExitHandler(watchProcess, "watch");
        }, 250);
    };

    const handleChildExit = (child, code) => {
        if (exiting) {
            return;
        }
        if (child && child.pid && ignoredExitPids.has(child.pid)) {
            ignoredExitPids.delete(child.pid);
            if (pendingRestart) {
                pendingRestart = false;
                spawnStart();
            }
            return;
        }
        if (child && child.__bwRole === "start") {
            if (pendingRestart) {
                pendingRestart = false;
                spawnStart();
                return;
            }
            const now = Date.now();
            if (now - lastStartExit < 2000) {
                startExitStreak += 1;
            } else {
                startExitStreak = 0;
            }
            lastStartExit = now;
            if (startExitStreak >= 3) {
                console.error("[bakerywave] start exited repeatedly. skipping auto-restart.");
                return;
            }
            if (restartingStart) {
                return;
            }
            restartingStart = true;
            setTimeout(() => {
                restartingStart = false;
                if (exiting) {
                    return;
                }
                spawnStart();
            }, 500);
            return;
        }
        if (child && child.__bwRole === "watch") {
            if (!pendingWatchRespawn) {
                const codeText = code === null || code === undefined ? "unknown" : String(code);
                console.error(`[bakerywave] reference watch exited (code: ${codeText}). not restarting.`);
                return;
            }
            pendingWatchRespawn = false;
            respawnWatch();
            return;
        }
        shutdown(code === null ? 1 : code);
    };

    const scheduleRestart = () => {
        if (!restartEnabled || exiting) {
            return;
        }
        if (restartTimer) {
            return;
        }
        restartTimer = setTimeout(() => {
            restartTimer = null;
            if (exiting) {
                return;
            }
            if (pendingRestart) {
                return;
            }
            pendingRestart = true;
            if (startProcess && startProcess.pid && startProcess.exitCode === null) {
                ignoredExitPids.add(startProcess.pid);
                killProcessTree(startProcess, "SIGTERM");
                ensureProcessExit(startProcess, 2000);
            } else {
                pendingRestart = false;
                spawnStart();
            }
            if (watchProcess && watchProcess.pid && watchProcess.exitCode === null) {
                pendingWatchRespawn = true;
                killProcessTree(watchProcess, "SIGTERM");
                ensureProcessExit(watchProcess, 2000);
            }
        }, 150);
    };

    const scheduleCliRestart = () => {
        if (!cliWatchReady) {
            return;
        }
        if (exiting || restartingSelf) {
            return;
        }
        if (cliRestartTimer) {
            return;
        }
        cliRestartTimer = setTimeout(() => {
            cliRestartTimer = null;
            if (exiting || restartingSelf) {
                return;
            }
            restartingSelf = true;
            shutdown(0, { restartSelf: true });
        }, 150);
    };

    const shutdown = (exitCode, options) => {
        const restartSelf = options && options.restartSelf === true;
        if (exiting) {
            return;
        }
        exiting = true;
        if (restartWatchTimer) {
            clearTimeout(restartWatchTimer);
            restartWatchTimer = null;
        }
        if (cliWatchTimer) {
            clearTimeout(cliWatchTimer);
            cliWatchTimer = null;
        }
        for (const watcher of [...restartWatchers, ...cliRestartWatchers]) {
            try {
                watcher.close();
            } catch (error) {
                // ignore
            }
        }
        for (const child of children) {
            if (child && child.pid && child.exitCode === null) {
                killProcessTree(child, "SIGTERM");
            }
        }
        if (restartSelf) {
            setTimeout(() => {
                spawn(process.execPath, process.argv.slice(1), {
                    stdio: "inherit",
                    cwd: process.cwd(),
                    env: { ...process.env, BAKERYWAVE_DEV_NO_OPEN: "1" },
                });
                process.exit(exitCode);
            }, 300);
            return;
        }
        process.exit(exitCode);
    };

    for (const child of children) {
        if (!child) {
            continue;
        }
        const role = child === startProcess ? "start" : "watch";
        attachExitHandler(child, role);
    }

    if (cliRestartWatchers.length > 0) {
        setTimeout(() => {
            cliWatchReady = true;
        }, 1000);
    }

    process.on("SIGINT", () => shutdown(0));
    process.on("SIGTERM", () => shutdown(0));
}


function printHelp() {
    console.log("bakerywave");
    console.log("\nUsage:");
    console.log("  bakerywave <command> [siteDir] [-- ...args]");
    console.log("\nCommands:");
    console.log("  init [dir]           Initialize a new documentation site");
    console.log("  start                Start Docusaurus dev server");
    console.log("  dev                  Start dev server with reference watch (auto restart)");
    console.log("  build                Build the site");
    console.log("  serve|preview        Serve the built site");
    console.log("  clear                Clear Docusaurus cache");
    console.log("  swizzle              Swizzle theme components");
    console.log("  write-translations   Generate translation files");
    console.log("  write-heading-ids    Generate heading ids");
    console.log("  reference build      Run docgen and JSON -> MDX");
    console.log("  reference watch      Watch sources and rebuild reference");
    console.log("\nGlobal Options:");
    console.log("  --cwd <dir>          Base working directory");
    console.log("  --site-dir <dir>     Site directory (default: website or cwd)");
    console.log("  --config <path>      Docusaurus config path");
    console.log("\nRun 'bakerywave <command> --help' for more information on a specific command.");
}

function printInitHelp() {
    console.log("bakerywave init");
    console.log("\nInitialize a new documentation site using the StoryBakery template.");
    console.log("\nUsage:");
    console.log("  bakerywave init [dir] [options]");
    console.log("\nOptions:");
    console.log("  --dir <dir>              Target directory (default: website)");
    console.log("  --template <path>        Template directory path");
    console.log("  --no-install             Skip package installation");
    console.log("  --package-manager <pm>   npm | pnpm | yarn | bun (default: npm)");
    console.log("  --force                  Allow non-empty directory");
}

function printDevHelp() {
    console.log("bakerywave dev");
    console.log("\nStart dev server with reference watch and auto-restart on config/plugin changes.");
    console.log("\nUsage:");
    console.log("  bakerywave dev [siteDir] [options] [-- ...docusaurusArgs]");
    console.log("\nOptions:");
    console.log("  --no-restart             Disable auto-restart when configuration or plugins change");
    console.log("  --dev-watch-cli          Watch bakerywave's own source code for changes");
    console.log("\nNote: Any additional arguments after '--' are passed directly to 'docusaurus start'.");
}

function printReferenceHelp() {
    console.log("bakerywave reference <subcommand>");
    console.log("\nManage API reference documentation (Luau docgen and MDX generation).");
    console.log("\nSubcommands:");
    console.log("  build                    Run docgen and generate reference MDX files");
    console.log("  watch                    Watch source files and rebuild reference automatically");
    console.log("\nOptions:");
    console.log("  --lang <lang>            Target language (default: luau)");
    console.log("  --root <dir>             Project root directory");
    console.log("  --src <dir>              Source directory for docgen");
    console.log("  --types <dir>            Directory containing type definitions");
    console.log("  --out-dir <dir>          Output directory for generated MDX files");
    console.log("  --manifest <path>        Path to reference manifest file");
    console.log("  --include-private        Include private members in documentation");
    console.log("  --no-clean               Don't clean output directory before generation");
    console.log("  --render-mode <mode>     Render mode ('mdx' or 'json')");
    console.log("  --fail-on-warning        Exit with error if docgen produces warnings");
    console.log("  --legacy                 Use legacy docgen logic");
    console.log("  --no-reference           Disable reference generation for this run");
}

function main() {
    const { head, tail } = splitArgs(process.argv.slice(2));
    const { cwd, siteDir, configPath, rest } = parseGlobalArgs(head);

    const isHelp = (arg) => arg === "--help" || arg === "-h" || arg === "help";

    if (rest.length === 0 || (rest.length === 1 && isHelp(rest[0]))) {
        printHelp();
        return;
    }

    const commandRaw = rest[0];
    const command = resolveCommand(commandRaw);
    const commandArgs = rest.slice(1);
    const hasHelpArg = commandArgs.some(isHelp) || tail.some(isHelp);

    if (hasHelpArg) {
        if (command === "dev") {
            printDevHelp();
            return;
        }
        if (command === "reference") {
            printReferenceHelp();
            return;
        }
        if (command === "init") {
            printInitHelp();
            return;
        }
        printHelp();
        return;
    }

    if (command === "help") {
        printHelp();
        return;
    }



    if (command === "init") {
        runInit(cwd, [...commandArgs, ...tail]);
        return;
    }

    let siteDirOverride = null;
    if ((DOCUSAURUS_COMMANDS.has(command) || command === "dev") && commandArgs[0] && !commandArgs[0].startsWith("-")) {
        siteDirOverride = commandArgs[0];
        commandArgs.shift();
    }

    const siteDirAbs = resolveSiteDir(cwd, siteDirOverride || siteDir);

    if (command === "dev") {
        const { args: devArgs, restart, watchCli } = parseDevArgs([...commandArgs, ...tail]);
        runDev(cwd, siteDirAbs, configPath, devArgs, { restart, watchCli });
        return;
    }

    if (DOCUSAURUS_COMMANDS.has(command)) {
        runDocusaurus(command, [...commandArgs, ...tail], siteDirAbs);
        return;
    }

    if (command === "reference") {
        const subcommand = commandArgs[0];
        const subArgs = commandArgs.slice(1);
        if (!subcommand || (subcommand !== "build" && subcommand !== "watch")) {
            printHelp();
            process.exit(1);
        }

        const loadedReferenceOptions = loadReferenceOptions(cwd, siteDirAbs, configPath);
        const { options: parsedOptions } = parseReferenceArgs(subArgs);
        const referenceOptions = resolveReferenceOptions(loadedReferenceOptions, parsedOptions);

        const searchPaths = [siteDirAbs, cwd, __dirname];
        let docgenScript;
        let generator;
        try {
            docgenScript = resolveDocgenScript(searchPaths);
            generator = resolveReferenceGenerator(searchPaths);
        } catch (error) {
            console.error("[bakerywave] required packages are missing.");
            console.error(error.message);
            process.exit(1);
        }

        const docgenFlags = {
            failOnWarning: parsedOptions.failOnWarning === true,
            legacy: parsedOptions.legacy === true,
        };

        if (subcommand === "build") {
            runReferenceBuild(docgenScript, generator, cwd, siteDirAbs, referenceOptions, docgenFlags, configPath);
            return;
        }

        runReferenceWatch(docgenScript, generator, cwd, siteDirAbs, referenceOptions, docgenFlags, configPath);
        return;
    }

    console.error(`[bakerywave] unknown command: ${commandRaw}`);
    process.exit(1);
}

main();
