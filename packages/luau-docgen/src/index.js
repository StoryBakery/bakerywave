const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const SUPPORTED_EXTS = new Set([".luau", ".lua"]);
const DEFAULT_SCHEMA_VERSION = 1;

function normalizePath(filePath) {
    return filePath.split(path.sep).join("/");
}

function readJsonIfExists(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
        return null;
    }
}

function collectFiles(rootDir) {
    if (!fs.existsSync(rootDir)) {
        return [];
    }

    const entries = fs.readdirSync(rootDir, { withFileTypes: true });
    const results = [];

    for (const entry of entries) {
        if (entry.name.startsWith(".")) {
            continue;
        }

        const entryPath = path.join(rootDir, entry.name);

        if (entry.isDirectory()) {
            if (entry.name === "node_modules") {
                continue;
            }

            results.push(...collectFiles(entryPath));
            continue;
        }

        const ext = path.extname(entry.name);
        if (SUPPORTED_EXTS.has(ext)) {
            results.push(entryPath);
        }
    }

    return results;
}

function sha1(content) {
    return crypto.createHash("sha1").update(content).digest("hex");
}

function dedentLines(lines) {
    let minIndent = null;

    for (const line of lines) {
        if (line.trim().length === 0) {
            continue;
        }

        const match = line.match(/^[ \t]*/);
        if (!match) {
            continue;
        }

        const indent = match[0].length;
        if (minIndent === null || indent < minIndent) {
            minIndent = indent;
        }
    }

    if (!minIndent) {
        return lines.slice();
    }

    return lines.map((line) => line.slice(minIndent));
}

function extractDocBlocks(lines) {
    const blocks = [];
    let index = 0;

    while (index < lines.length) {
        const line = lines[index];
        const trimmed = line.trim();

        if (trimmed.startsWith("---")) {
            const contentLines = [];
            let start = index;

            while (index < lines.length && lines[index].trim().startsWith("---")) {
                const raw = lines[index].replace(/^\s*---\s?/, "");
                contentLines.push(raw);
                index += 1;
            }

            const end = index - 1;
            blocks.push({
                startLine: start + 1,
                endLine: end + 1,
                contentLines,
            });
            continue;
        }

        if (trimmed.startsWith("--[=[")) {
            const contentLines = [];
            const start = index;
            let foundEnd = false;
            let current = line;
            const startOffset = current.indexOf("--[=[") + 5;
            const afterStart = current.slice(startOffset);
            if (afterStart.length > 0) {
                contentLines.push(afterStart);
            }
            index += 1;

            while (index < lines.length) {
                const currentLine = lines[index];
                const endIndex = currentLine.indexOf("]=]");

                if (endIndex !== -1) {
                    const beforeEnd = currentLine.slice(0, endIndex);
                    if (beforeEnd.length > 0) {
                        contentLines.push(beforeEnd);
                    }
                    foundEnd = true;
                    break;
                }

                contentLines.push(currentLine);
                index += 1;
            }

            const end = foundEnd ? index : lines.length - 1;
            blocks.push({
                startLine: start + 1,
                endLine: end + 1,
                contentLines,
            });

            index = foundEnd ? index + 1 : lines.length;
            continue;
        }

        index += 1;
    }

    return blocks;
}

function parseParamList(paramText) {
    const trimmed = paramText.trim();
    if (!trimmed) {
        return [];
    }

    const parts = trimmed.split(",");
    const params = [];

    for (const part of parts) {
        const token = part.trim();
        if (!token) {
            continue;
        }

        if (token === "...") {
            params.push({ name: "...", type: null });
            continue;
        }

        const nameMatch = token.match(/^([A-Za-z_][A-Za-z0-9_]*)/);
        const name = nameMatch ? nameMatch[1] : token;
        let type = null;

        const typeIndex = token.indexOf(":");
        if (typeIndex !== -1) {
            type = token.slice(typeIndex + 1).trim();
            const assignIndex = type.indexOf("=");
            if (assignIndex !== -1) {
                type = type.slice(0, assignIndex).trim();
            }
            if (type.length === 0) {
                type = null;
            }
        }

        params.push({ name, type });
    }

    return params;
}

function findTopLevelWhitespace(value) {
    let depthAngle = 0;
    let depthRound = 0;
    let depthCurly = 0;
    let depthSquare = 0;
    let quote = null;
    let escaped = false;

    for (let index = 0; index < value.length; index += 1) {
        const char = value[index];

        if (quote) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (char === "\\") {
                escaped = true;
                continue;
            }
            if (char === quote) {
                quote = null;
            }
            continue;
        }

        if (char === "'" || char === "\"") {
            quote = char;
            continue;
        }

        if (char === "<") {
            depthAngle += 1;
            continue;
        }
        if (char === ">") {
            if (depthAngle > 0) {
                depthAngle -= 1;
            }
            continue;
        }
        if (char === "(") {
            depthRound += 1;
            continue;
        }
        if (char === ")") {
            if (depthRound > 0) {
                depthRound -= 1;
            }
            continue;
        }
        if (char === "{") {
            depthCurly += 1;
            continue;
        }
        if (char === "}") {
            if (depthCurly > 0) {
                depthCurly -= 1;
            }
            continue;
        }
        if (char === "[") {
            depthSquare += 1;
            continue;
        }
        if (char === "]") {
            if (depthSquare > 0) {
                depthSquare -= 1;
            }
            continue;
        }

        if (
            /\s/.test(char) &&
            depthAngle === 0 &&
            depthRound === 0 &&
            depthCurly === 0 &&
            depthSquare === 0
        ) {
            return index;
        }
    }

    return -1;
}

function splitTopLevelByComma(value) {
    const parts = [];
    let start = 0;
    let depthAngle = 0;
    let depthRound = 0;
    let depthCurly = 0;
    let depthSquare = 0;
    let quote = null;
    let escaped = false;

    for (let index = 0; index < value.length; index += 1) {
        const char = value[index];

        if (quote) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (char === "\\") {
                escaped = true;
                continue;
            }
            if (char === quote) {
                quote = null;
            }
            continue;
        }

        if (char === "'" || char === "\"") {
            quote = char;
            continue;
        }

        if (char === "<") {
            depthAngle += 1;
            continue;
        }
        if (char === ">") {
            if (depthAngle > 0) {
                depthAngle -= 1;
            }
            continue;
        }
        if (char === "(") {
            depthRound += 1;
            continue;
        }
        if (char === ")") {
            if (depthRound > 0) {
                depthRound -= 1;
            }
            continue;
        }
        if (char === "{") {
            depthCurly += 1;
            continue;
        }
        if (char === "}") {
            if (depthCurly > 0) {
                depthCurly -= 1;
            }
            continue;
        }
        if (char === "[") {
            depthSquare += 1;
            continue;
        }
        if (char === "]") {
            if (depthSquare > 0) {
                depthSquare -= 1;
            }
            continue;
        }

        if (
            char === "," &&
            depthAngle === 0 &&
            depthRound === 0 &&
            depthCurly === 0 &&
            depthSquare === 0
        ) {
            const part = value.slice(start, index).trim();
            if (part) {
                parts.push(part);
            }
            start = index + 1;
        }
    }

    const tail = value.slice(start).trim();
    if (tail) {
        parts.push(tail);
    }

    return parts;
}

function findTopLevelChar(value, target) {
    let depthAngle = 0;
    let depthRound = 0;
    let depthCurly = 0;
    let depthSquare = 0;
    let quote = null;
    let escaped = false;

    for (let index = 0; index < value.length; index += 1) {
        const char = value[index];

        if (quote) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (char === "\\") {
                escaped = true;
                continue;
            }
            if (char === quote) {
                quote = null;
            }
            continue;
        }

        if (char === "'" || char === "\"") {
            quote = char;
            continue;
        }

        if (char === "<") {
            depthAngle += 1;
            continue;
        }
        if (char === ">") {
            if (depthAngle > 0) {
                depthAngle -= 1;
            }
            continue;
        }
        if (char === "(") {
            depthRound += 1;
            continue;
        }
        if (char === ")") {
            if (depthRound > 0) {
                depthRound -= 1;
            }
            continue;
        }
        if (char === "{") {
            depthCurly += 1;
            continue;
        }
        if (char === "}") {
            if (depthCurly > 0) {
                depthCurly -= 1;
            }
            continue;
        }
        if (char === "[") {
            depthSquare += 1;
            continue;
        }
        if (char === "]") {
            if (depthSquare > 0) {
                depthSquare -= 1;
            }
            continue;
        }

        if (
            char === target &&
            depthAngle === 0 &&
            depthRound === 0 &&
            depthCurly === 0 &&
            depthSquare === 0
        ) {
            return index;
        }
    }

    return -1;
}

function findMatchingAngleBracket(value, startIndex) {
    if (!value || value[startIndex] !== "<") {
        return -1;
    }

    let depth = 0;
    let quote = null;
    let escaped = false;

    for (let index = startIndex; index < value.length; index += 1) {
        const char = value[index];

        if (quote) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (char === "\\") {
                escaped = true;
                continue;
            }
            if (char === quote) {
                quote = null;
            }
            continue;
        }

        if (char === "'" || char === "\"") {
            quote = char;
            continue;
        }

        if (char === "<") {
            depth += 1;
            continue;
        }
        if (char === ">") {
            depth -= 1;
            if (depth === 0) {
                return index;
            }
            continue;
        }
    }

    return -1;
}

function parseTypeParameterEntry(entry) {
    const raw = entry ? entry.trim() : "";
    if (!raw) {
        return null;
    }

    const equalIndex = findTopLevelChar(raw, "=");
    const left = equalIndex === -1 ? raw : raw.slice(0, equalIndex).trim();
    const defaultValue = equalIndex === -1 ? null : raw.slice(equalIndex + 1).trim() || null;

    const colonIndex = findTopLevelChar(left, ":");
    const name = colonIndex === -1 ? left : left.slice(0, colonIndex).trim();
    const type = colonIndex === -1 ? null : left.slice(colonIndex + 1).trim() || null;

    if (!name) {
        return null;
    }

    return {
        name,
        type,
        default: defaultValue,
    };
}

function parseTypeParameters(typeParamsText) {
    const text = typeParamsText ? typeParamsText.trim() : "";
    if (!text) {
        return [];
    }

    return splitTopLevelByComma(text)
        .map(parseTypeParameterEntry)
        .filter(Boolean);
}

function parseTypeAliasDeclaration(line) {
    const match = line.match(/^\s*(?:export\s+)?type\s+([A-Za-z_][A-Za-z0-9_]*)\s*(.*)$/);
    if (!match) {
        return null;
    }

    const name = match[1];
    let rest = (match[2] || "").trim();
    let typeParams = [];

    if (rest.startsWith("<")) {
        const closeIndex = findMatchingAngleBracket(rest, 0);
        if (closeIndex === -1) {
            return null;
        }
        const paramsText = rest.slice(1, closeIndex);
        typeParams = parseTypeParameters(paramsText);
        rest = rest.slice(closeIndex + 1).trim();
    }

    if (!rest.startsWith("=")) {
        return null;
    }

    const typeText = rest.slice(1).trim();
    if (!typeText) {
        return null;
    }

    const isTableType =
        typeText.includes("{") ||
        typeText.startsWith("setmetatable") ||
        typeText.startsWith("setmetatable<") ||
        typeText.startsWith("setmetatable <");

    return {
        name,
        type: typeText,
        typeParams,
        isTableType,
    };
}

function parseTypeTagName(rawName) {
    const text = rawName ? rawName.trim() : "";
    if (!text) {
        return { name: "", typeParams: [] };
    }

    const openIndex = text.indexOf("<");
    if (openIndex === -1) {
        return { name: text, typeParams: [] };
    }

    const closeIndex = findMatchingAngleBracket(text, openIndex);
    if (closeIndex === -1 || closeIndex !== text.length - 1) {
        return { name: text, typeParams: [] };
    }

    const name = text.slice(0, openIndex).trim();
    const typeParams = parseTypeParameters(text.slice(openIndex + 1, closeIndex));

    return {
        name: name || text,
        typeParams,
    };
}

function parseFunctionBinding(line) {
    const trimmed = line.trim();
    const declMatch = trimmed.match(
        /^function\s+([A-Za-z0-9_\.:]+)(<[^>]+>)?\s*\(([^)]*)\)\s*(?::\s*(.+))?$/
    );

    if (declMatch) {
        const nameRaw = declMatch[1];
        const paramsRaw = declMatch[3] || "";
        const returnType = declMatch[4] ? declMatch[4].trim() : null;
        return buildFunctionInfo(nameRaw, paramsRaw, returnType);
    }

    const assignMatch = trimmed.match(
        /^([A-Za-z0-9_\.]+)\s*=\s*function(?:<[^>]+>)?\s*\(([^)]*)\)\s*(?::\s*(.+))?$/
    );

    if (assignMatch) {
        const nameRaw = assignMatch[1];
        const paramsRaw = assignMatch[2] || "";
        const returnType = assignMatch[3] ? assignMatch[3].trim() : null;
        return buildFunctionInfo(nameRaw, paramsRaw, returnType);
    }

    return null;
}

function buildFunctionInfo(nameRaw, paramsRaw, returnType) {
    const params = parseParamList(paramsRaw);
    let within = null;
    let name = nameRaw;
    let isMethod = false;

    const colonIndex = nameRaw.lastIndexOf(":");
    const dotIndex = nameRaw.lastIndexOf(".");

    if (colonIndex !== -1 && colonIndex > dotIndex) {
        within = nameRaw.slice(0, colonIndex);
        name = nameRaw.slice(colonIndex + 1);
        isMethod = true;
    } else if (dotIndex !== -1) {
        within = nameRaw.slice(0, dotIndex);
        name = nameRaw.slice(dotIndex + 1);
    }

    if (!isMethod && within && params.length > 0) {
        if (params[0].name === "self") {
            isMethod = true;
        }
    }

    if (within && within.endsWith(".prototype")) {
        within = within.slice(0, -".prototype".length);
        isMethod = true;
    }

    return {
        kind: "function",
        name,
        within,
        isMethod,
        params,
        returnType,
    };
}

function matchTypeTableDeclaration(line) {
    const typeAlias = parseTypeAliasDeclaration(line);
    if (!typeAlias || !typeAlias.isTableType) {
        return null;
    }

    return { name: typeAlias.name };
}

function parseBindingAt(lines, index) {
    const line = lines[index];
    const cleanLine = line.split("--")[0];
    const functionInfo = parseFunctionBinding(cleanLine);
    if (functionInfo) {
        return functionInfo;
    }

    const typeAlias = parseTypeAliasDeclaration(cleanLine);
    if (typeAlias) {
        const binding = {
            kind: "type",
            name: typeAlias.name,
            within: null,
            typeAlias: typeAlias.type,
            typeParams: typeAlias.typeParams,
            typeFields: [],
        };
        if (typeAlias.isTableType) {
            const result = extractTypeTableFields(lines, index);
            binding.typeFields = result.fields;
            binding.typeTableRange = { startLine: index + 1, endLine: result.endIndex + 1 };
        }
        return binding;
    }

    const assignMatch = cleanLine.match(/^([A-Za-z0-9_\.]+)\s*=/);
    if (assignMatch) {
        const nameRaw = assignMatch[1];
        const dotIndex = nameRaw.lastIndexOf(".");
        if (dotIndex !== -1) {
            let within = nameRaw.slice(0, dotIndex);
            if (within.endsWith(".prototype")) {
                within = within.slice(0, -".prototype".length);
            }
            return {
                kind: "property",
                name: nameRaw.slice(dotIndex + 1),
                within,
            };
        }
    }

    // NOTE: Local variable tables should not be automatically classified as classes.
    // If a local table needs to be documented as a class, use an explicit @class tag.
    // Previously:
    // const classMatch = cleanLine.match(/^local\s+([A-Za-z0-9_]+)\s*=\s*\{/);
    // if (classMatch) { return { kind: "class", name: classMatch[1], within: null }; }

    return null;
}

function parseTagLine(tagLine) {
    const match = tagLine.match(/^@([A-Za-z_][A-Za-z0-9_]*)\s*(.*)$/);
    if (!match) {
        return null;
    }

    return {
        name: match[1],
        value: match[2] ? match[2].trim() : "",
    };
}

function splitTagValue(value) {
    const text = value ? value.trim() : "";
    if (!text) {
        return { name: "", rest: "" };
    }

    const boundary = findTopLevelWhitespace(text);
    if (boundary === -1) {
        return { name: text, rest: "" };
    }

    const name = text.slice(0, boundary).trim();
    const rest = text.slice(boundary + 1).trim();
    return { name, rest };
}

function parseTypeAndDescription(value) {
    const parts = value.split("--");
    const typePart = parts[0] ? parts[0].trim() : "";
    const description = parts.length > 1 ? parts.slice(1).join("--").trim() : "";
    return { typePart, description };
}

function parseTypeAndDescriptionDash(value) {
    const text = value ? value.trim() : "";
    if (!text) {
        return { typePart: "", description: "" };
    }

    if (text.startsWith("-")) {
        return { typePart: "", description: text.slice(1).trim() };
    }

    const index = text.search(/\s-\s/);
    if (index === -1) {
        return { typePart: text, description: "" };
    }
    return {
        typePart: text.slice(0, index).trim(),
        description: text.slice(index + 3).trim(),
    };
}

function parseOptionBooleanValue(value, fallback = true) {
    const text = value ? value.trim().toLowerCase() : "";
    if (!text) {
        return fallback;
    }

    if (text === "true" || text === "1" || text === "yes" || text === "on") {
        return true;
    }
    if (text === "false" || text === "0" || text === "no" || text === "off") {
        return false;
    }

    return null;
}

function parseMemberName(value) {
    const trimmed = value ? value.trim() : "";
    if (!trimmed) {
        return { within: null, name: "", isMethod: false };
    }

    if (trimmed.startsWith("~:")) {
        return { within: "~", name: trimmed.slice(2), isMethod: true };
    }

    if (trimmed.startsWith("~.")) {
        return { within: "~", name: trimmed.slice(2), isMethod: false };
    }

    const colonIndex = trimmed.lastIndexOf(":");
    const dotIndex = trimmed.lastIndexOf(".");

    if (colonIndex !== -1 && colonIndex > dotIndex) {
        return {
            within: trimmed.slice(0, colonIndex),
            name: trimmed.slice(colonIndex + 1),
            isMethod: true,
        };
    }

    if (dotIndex !== -1) {
        let within = trimmed.slice(0, dotIndex);
        let isMethod = false;
        if (within.endsWith(".prototype")) {
            within = within.slice(0, -".prototype".length);
            isMethod = true;
        }
        return { within, name: trimmed.slice(dotIndex + 1), isMethod };
    }

    return { within: null, name: trimmed, isMethod: false };
}

function countChar(value, char) {
    let count = 0;
    for (const current of value) {
        if (current === char) {
            count += 1;
        }
    }
    return count;
}

function joinInlineDescription(lines) {
    if (!lines || lines.length === 0) {
        return "";
    }
    const trimmed = lines.slice();
    while (trimmed.length > 0 && trimmed[0].trim().length === 0) {
        trimmed.shift();
    }
    while (trimmed.length > 0 && trimmed[trimmed.length - 1].trim().length === 0) {
        trimmed.pop();
    }
    return trimmed.join("\n").trimEnd();
}

function extractTypeTableFields(lines, startIndex) {
    const fields = [];
    let depth = 0;
    let started = false;
    let index = startIndex;
    let endIndex = startIndex;
    let pendingDoc = null;

    for (; index < lines.length; index += 1) {
        const line = lines[index];
        const trimmed = line.trim();

        if (!started) {
            const braceIndex = line.indexOf("{");
            if (braceIndex !== -1) {
                started = true;
                depth = 1;
            }
        } else {
            depth += countChar(line, "{");
            depth -= countChar(line, "}");
        }

        if (!started) {
            continue;
        }

        if (trimmed.startsWith("---")) {
            const contentLines = [];
            let cursor = index;
            while (cursor < lines.length && lines[cursor].trim().startsWith("---")) {
                contentLines.push(lines[cursor].replace(/^\s*---\s?/, ""));
                cursor += 1;
            }
            pendingDoc = contentLines;
            index = cursor - 1;
            continue;
        }

        if (trimmed.startsWith("--[=[")) {
            const contentLines = [];
            let cursor = index;
            const startOffset = lines[cursor].indexOf("--[=[") + 5;
            const afterStart = lines[cursor].slice(startOffset);
            if (afterStart.length > 0) {
                contentLines.push(afterStart);
            }
            cursor += 1;
            while (cursor < lines.length) {
                const current = lines[cursor];
                const endIndex = current.indexOf("]=]");
                if (endIndex !== -1) {
                    const beforeEnd = current.slice(0, endIndex);
                    if (beforeEnd.length > 0) {
                        contentLines.push(beforeEnd);
                    }
                    break;
                }
                contentLines.push(current);
                cursor += 1;
            }
            pendingDoc = contentLines;
            index = cursor;
            continue;
        }

        const fieldMatch = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/);
        if (fieldMatch) {
            const name = fieldMatch[1];
            let typeText = fieldMatch[2] || "";
            let continueIndex = index;

            while (typeText.trim().length > 0 && !typeText.trim().endsWith(",") && !typeText.includes("}") && continueIndex + 1 < lines.length) {
                if (lines[continueIndex].includes("}") || lines[continueIndex].includes(",")) {
                    break;
                }
                continueIndex += 1;
                typeText += "\n" + lines[continueIndex].trim();
                if (lines[continueIndex].includes("}") || lines[continueIndex].includes(",")) {
                    break;
                }
            }

            typeText = typeText.replace(/[,}].*$/, "").trim();
            const description = joinInlineDescription(pendingDoc);
            pendingDoc = null;

            fields.push({
                name,
                type: typeText || null,
                description: description || null,
                line: index + 1,
            });
        }

        if (depth <= 0) {
            endIndex = index;
            break;
        }
    }

    return { fields, endIndex };
}

function findTypeTableDeclarations(lines) {
    const declarations = [];
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const match = matchTypeTableDeclaration(line);
        if (match) {
            const result = extractTypeTableFields(lines, i);
            declarations.push({
                name: match.name,
                startLine: i + 1,
                endLine: result.endIndex + 1,
                fields: result.fields,
            });
            i = result.endIndex;
        }
    }
    return declarations;
}

function parseDocBlock(contentLines) {
    const lines = dedentLines(contentLines);
    const descriptionLines = [];
    const fields = [];
    const variants = [];
    const params = [];
    const returns = [];
    const errors = [];
    const tags = [];
    const customTags = [];
    const realms = [];
    const externals = [];

    const typeTags = [];
    const state = {
        within: null,
        yields: false,
        readonly: false,
        visibility: null,
        since: null,
        unreleased: false,
        deprecated: null,
        indexName: null,
        inheritDoc: null,
        includes: [],
        snippets: [],
        aliases: [],
        event: false,
        extends: [],
        categories: [],
        groups: [],
        withinDefault: null,
        withinRequire: false,
        hasWithinDefault: false,
        hasWithinRequire: false,
        fileMeta: false,
    };

    let inFence = false;
    let continuation = null;

    const handleBlockLine = (rawLine, target) => {
        if (!target) {
            return;
        }
        const trimmedLine = rawLine.trim();
        if (!trimmedLine) {
            target.description.push("");
            return;
        }
        if (target.allowDefault && trimmedLine.startsWith("@default")) {
            let value = trimmedLine.slice("@default".length).trim();
            if (value.startsWith(":")) {
                value = value.slice(1).trim();
            }
            target.default = value || null;
            target.hasDefault = true;
            return;
        }
        target.description.push(rawLine.trimEnd());
    };

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("```")) {
            inFence = !inFence;
        }

        const indentMatch = line.match(/^[ \t]+/);
        const indent = indentMatch ? indentMatch[0] : "";
        const afterIndent = line.slice(indent.length);
        const isContinuation =
            continuation &&
            (indent.includes("\t") || indent.length >= 2) &&
            afterIndent.trim().length >= 0 &&
            !(afterIndent.trim().startsWith("@") || afterIndent.trim().startsWith("."));

        if (isContinuation && !inFence) {
            if (continuation.allowDefault) {
                handleBlockLine(afterIndent.trimEnd(), continuation);
            } else {
                continuation.description.push(afterIndent.trimEnd());
            }
            continue;
        }

        continuation = null;

        if (!inFence && trimmed.startsWith("@")) {
            const tag = parseTagLine(trimmed);
            if (!tag) {
                continue;
            }

            switch (tag.name) {
                case "class":
                    typeTags.push({ kind: "class", name: tag.value });
                    break;
                case "prop": {
                    const { name: rawName, rest } = splitTagValue(tag.value);
                    const parsed = parseMemberName(rawName);
                    if (parsed.within && !state.within) {
                        state.within = parsed.within;
                    }
                    typeTags.push({ kind: "property", name: parsed.name, type: rest || null });
                    break;
                }
                case "type": {
                    const { name: rawName, rest } = splitTagValue(tag.value);
                    const parsedTypeName = parseTypeTagName(rawName);
                    typeTags.push({
                        kind: "type",
                        name: parsedTypeName.name,
                        type: rest || null,
                        typeParams: parsedTypeName.typeParams,
                    });
                    break;
                }
                case "interface":
                    typeTags.push({ kind: "interface", name: tag.value });
                    break;
                case "function": {
                    const parsed = parseMemberName(tag.value);
                    if (parsed.within && !state.within) {
                        state.within = parsed.within;
                    }
                    typeTags.push({ kind: "function", name: parsed.name, isMethod: parsed.isMethod });
                    break;
                }
                case "method": {
                    const parsed = parseMemberName(tag.value);
                    if (parsed.within && !state.within) {
                        state.within = parsed.within;
                    }
                    typeTags.push({ kind: "function", name: parsed.name, isMethod: true });
                    break;
                }
                case "constructor": {
                    const parsed = parseMemberName(tag.value);
                    if (parsed.within && !state.within) {
                        state.within = parsed.within;
                    }
                    typeTags.push({ kind: "constructor", name: parsed.name, isMethod: false });
                    break;
                }
                case "within":
                    state.within = tag.value;
                    break;
                case "file":
                    state.fileMeta = true;
                    break;
                case "option": {
                    const { name: optionName, rest: optionValue } = splitTagValue(tag.value);
                    state.fileMeta = true;
                    if (optionName === "within.default") {
                        state.withinDefault = optionValue || null;
                        state.hasWithinDefault = true;
                    } else if (optionName === "within.require") {
                        const parsedValue = parseOptionBooleanValue(optionValue, true);
                        if (parsedValue !== null) {
                            state.withinRequire = parsedValue;
                            state.hasWithinRequire = true;
                        }
                    }
                    break;
                }
                case "field": {
                    const { name, rest } = splitTagValue(tag.value);
                    const { typePart, description } = parseTypeAndDescription(rest);
                    fields.push({ name, type: typePart || null, description: description || null });
                    break;
                }
                case "param": {
                    const { name, rest } = splitTagValue(tag.value);
                    const { typePart, description } = parseTypeAndDescriptionDash(rest);
                    const param = {
                        name,
                        type: typePart || null,
                        description: [],
                        default: null,
                        hasDefault: false,
                        allowDefault: true,
                    };
                    params.push(param);

                    if (description) {
                        param.description.push(description);
                    }
                    continuation = param;
                    break;
                }
                case "variant": {
                    const { typePart, description } = parseTypeAndDescriptionDash(tag.value);
                    const variant = {
                        value: typePart || "",
                        description: [],
                        default: null,
                        hasDefault: false,
                        allowDefault: true,
                    };
                    variants.push(variant);

                    if (description) {
                        variant.description.push(description);
                    }
                    continuation = variant;
                    break;
                }
                case "return": {
                    const { typePart, description } = parseTypeAndDescriptionDash(tag.value);
                    const ret = {
                        type: typePart || null,
                        description: [],
                        allowDefault: false,
                    };
                    returns.push(ret);
                    if (description) {
                        ret.description.push(description);
                    }
                    continuation = ret;
                    break;
                }
                case "error": {
                    const { typePart, description } = parseTypeAndDescription(tag.value);
                    const err = {
                        type: typePart || null,
                        description: description ? [description] : [],
                        allowDefault: false,
                    };
                    errors.push(err);
                    continuation = err;
                    break;
                }
                case "yields":
                    state.yields = true;
                    break;
                case "tag":
                    if (tag.value) {
                        tags.push(tag.value);
                    }
                    break;
                case "category":
                    if (tag.value) {
                        state.categories.push(tag.value);
                    }
                    break;
                case "group":
                    if (tag.value) {
                        state.groups.push(tag.value);
                    }
                    break;
                case "event":
                    state.event = true;
                    if (tag.value) {
                        const parsed = parseMemberName(tag.value);
                        if (parsed.within && !state.within) {
                            state.within = parsed.within;
                        }
                        typeTags.push({ kind: "event", name: parsed.name, isMethod: false });
                    }
                    break;
                case "extends":
                    if (tag.value) {
                        state.extends.push(tag.value);
                    }
                    break; case "unreleased":
                    state.unreleased = true;
                    break;
                case "since":
                    state.since = tag.value || null;
                    break;
                case "deprecated": {
                    const { typePart, description } = parseTypeAndDescription(tag.value);
                    state.deprecated = {
                        version: typePart || null,
                        description: description || null,
                    };
                    break;
                }
                case "server":
                case "client":
                case "plugin":
                    realms.push(tag.name);
                    break;
                case "private":
                    state.visibility = "private";
                    break;
                case "ignore":
                    state.visibility = "ignored";
                    break;
                case "readonly":
                    state.readonly = true;
                    break;
                case "__index":
                    state.indexName = tag.value || null;
                    break;
                case "external": {
                    const { name, rest } = splitTagValue(tag.value);
                    if (name && rest) {
                        externals.push({ name, url: rest });
                    }
                    break;
                }
                case "inheritDoc":
                    state.inheritDoc = tag.value || null;
                    break;
                case "include":
                    if (tag.value) {
                        state.includes.push(tag.value);
                    }
                    break;
                case "snippet":
                    if (tag.value) {
                        state.snippets.push(tag.value);
                    }
                    break;
                case "alias":
                    if (tag.value) {
                        state.aliases.push(tag.value);
                    }
                    break;
                default: {
                    const { typePart, description } = parseTypeAndDescription(tag.value);
                    const custom = {
                        name: tag.name,
                        value: typePart || null,
                        description: [],
                        allowDefault: false,
                    };
                    customTags.push(custom);

                    if (description) {
                        custom.description.push(description);
                    }
                    continuation = custom;
                    break;
                }
            }

            continue;
        }

        if (!inFence && trimmed.startsWith(".")) {
            const fieldLine = trimmed.slice(1).trim();
            const { name, rest } = splitTagValue(fieldLine);
            const { typePart, description } = parseTypeAndDescription(rest);
            fields.push({ name, type: typePart || null, description: description || null });
            continue;
        }

        descriptionLines.push(line.trimEnd());
    }

    return {
        descriptionLines,
        typeTags,
        fields,
        variants,
        params,
        returns,
        errors,
        tags,
        customTags,
        realms,
        externals,
        state,
    };
}

function joinDescription(lines) {
    const trimmedLines = lines.slice();
    while (trimmedLines.length > 0 && trimmedLines[0].trim().length === 0) {
        trimmedLines.shift();
    }

    const text = trimmedLines.join("\n").trimEnd();
    if (!text) {
        return { summary: "", descriptionMarkdown: "" };
    }

    const summaryLine = text
        .split("\n")
        .map((line) => line.trim())
        .find((line) => line.length > 0);

    return {
        summary: summaryLine || "",
        descriptionMarkdown: text,
    };
}

function hasOnlyWhitespaceBeforeLine(lines, lineNumber) {
    const limit = Math.max(0, lineNumber - 1);
    for (let index = 0; index < limit; index += 1) {
        if (lines[index].trim().length > 0) {
            return false;
        }
    }
    return true;
}

function isDocStateEmpty(state) {
    return (
        !state.within &&
        state.fileMeta !== true &&
        !state.withinDefault &&
        state.withinRequire !== true &&
        state.yields !== true &&
        state.readonly !== true &&
        !state.visibility &&
        !state.since &&
        state.unreleased !== true &&
        !state.deprecated &&
        !state.indexName &&
        !state.inheritDoc &&
        state.event !== true &&
        (!state.extends || state.extends.length === 0) &&
        (!state.categories || state.categories.length === 0) &&
        (!state.groups || state.groups.length === 0) &&
        (!state.includes || state.includes.length === 0) &&
        (!state.snippets || state.snippets.length === 0) &&
        (!state.aliases || state.aliases.length === 0)
    );
}

function isImplicitClassDocCandidate(doc) {
    if (!doc || !isDocStateEmpty(doc.state)) {
        return false;
    }

    return (
        doc.typeTags.length === 0 &&
        doc.fields.length === 0 &&
        doc.variants.length === 0 &&
        doc.params.length === 0 &&
        doc.returns.length === 0 &&
        doc.errors.length === 0 &&
        doc.tags.length === 0 &&
        doc.customTags.length === 0 &&
        doc.realms.length === 0 &&
        doc.externals.length === 0
    );
}

function inferClassNameFromFilePath(filePath) {
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    if (baseName === "init" || baseName === "init.client" || baseName === "init.server") {
        const parentName = path.basename(path.dirname(filePath));
        return parentName || baseName;
    }
    return baseName;
}

function shouldInferImplicitFileClass(lines, block, blockIndex, doc) {
    if (blockIndex !== 0) {
        return false;
    }
    if (!isImplicitClassDocCandidate(doc)) {
        return false;
    }
    if (!hasOnlyWhitespaceBeforeLine(lines, block.startLine)) {
        return false;
    }

    const startLineIndex = block.startLine - 1;
    if (startLineIndex < 0 || startLineIndex >= lines.length) {
        return false;
    }

    return lines[startLineIndex].trim().startsWith("--[=[");
}

function buildQualifiedName(within, name, isMethod) {
    if (!within) {
        return name;
    }

    return isMethod ? `${within}:${name}` : `${within}.${name}`;
}

function buildLocation(relativePath, lineNumber, lineContent) {
    const column = lineContent ? lineContent.search(/\S/) + 1 : 1;
    return {
        file: normalizePath(relativePath),
        line: lineNumber,
        column: column > 0 ? column : 1,
    };
}

function resolveBindingParams(binding) {
    if (!binding || !Array.isArray(binding.params)) {
        return [];
    }
    return binding.params;
}

function buildFunctionTypes(doc, binding) {
    const structured = {
        params: [],
        returns: [],
        errors: [],
        yields: doc.state.yields,
    };

    const bindingParams = resolveBindingParams(binding);
    const docParams = doc.params;

    if (docParams.length > 0) {
        for (const param of docParams) {
            const matched = bindingParams.find((item) => item.name === param.name);
            structured.params.push({
                name: param.name,
                type: param.type || (matched ? matched.type : null),
                description: param.description.join("\n").trim() || null,
                default: param.default || null,
            });
        }
    } else {
        for (const param of bindingParams) {
            structured.params.push({
                name: param.name,
                type: param.type,
                description: null,
                default: null,
            });
        }
    }

    if (doc.returns.length > 0) {
        for (const ret of doc.returns) {
            structured.returns.push({
                type: ret.type || null,
                description: ret.description.join("\n").trim() || null,
            });
        }
    } else if (binding && binding.returnType) {
        structured.returns.push({ type: binding.returnType, description: null });
    }

    for (const err of doc.errors) {
        structured.errors.push({
            type: err.type || null,
            description: err.description.join("\n").trim() || null,
        });
    }

    const displayParams = structured.params
        .map((param) => (param.type ? `${param.name}: ${param.type}` : param.name))
        .join(", ");
    const displayReturns = structured.returns
        .map((ret) => ret.type || "any")
        .join(", ");

    const display = displayReturns
        ? `(${displayParams}) -> ${displayReturns}`
        : `(${displayParams})`;

    return { display, structured };
}

function buildPropertyTypes(doc, fallbackType) {
    const type = doc.typeTags.find((tag) => tag.kind === "property");
    const resolvedType = type && type.type ? type.type : fallbackType || null;
    return {
        display: resolvedType || "",
        structured: {
            type: resolvedType,
            readonly: doc.state.readonly,
        },
    };
}

function buildInterfaceTypes(doc) {
    const fields = doc.fields.map((field) => ({
        name: field.name,
        type: field.type,
        description: field.description,
    }));
    return {
        display: "",
        structured: { fields },
    };
}

function buildTypeTypes(doc, binding) {
    const typeTag = doc.typeTags.find((tag) => tag.kind === "type");
    const typeValue = (typeTag && typeTag.type) || (binding && binding.typeAlias) || null;
    const tagTypeParams = typeTag && Array.isArray(typeTag.typeParams) ? typeTag.typeParams : [];
    const bindingTypeParams = binding && Array.isArray(binding.typeParams) ? binding.typeParams : [];
    const resolvedTypeParams = bindingTypeParams.length > 0 ? bindingTypeParams : tagTypeParams;
    const params = [];

    if (doc.params.length > 0) {
        const consumed = new Set();
        for (const param of doc.params) {
            const matched = resolvedTypeParams.find((item) => item.name === param.name);
            params.push({
                name: param.name,
                type: param.type || (matched ? matched.type || null : null),
                description: param.description.join("\n").trim() || null,
                default: param.default || (matched ? matched.default || null : null),
            });
            consumed.add(param.name);
        }

        for (const item of resolvedTypeParams) {
            if (!item || !item.name || consumed.has(item.name)) {
                continue;
            }
            params.push({
                name: item.name,
                type: item.type || null,
                description: null,
                default: item.default || null,
            });
        }
    } else {
        for (const item of resolvedTypeParams) {
            if (!item || !item.name) {
                continue;
            }
            params.push({
                name: item.name,
                type: item.type || null,
                description: null,
                default: item.default || null,
            });
        }
    }

    const variants = doc.variants.map((variant) => ({
        value: variant.value || "",
        description: variant.description.join("\n").trim() || null,
        default: variant.default || null,
        isDefault: Boolean(variant.hasDefault),
    }));
    return {
        display: typeValue || "",
        structured: { type: typeValue, params, variants },
    };
}

function buildClassTypes(doc) {
    return {
        display: "",
        structured: { indexName: doc.state.indexName },
    };
}

function buildDocs(doc) {
    const { summary, descriptionMarkdown } = joinDescription(doc.descriptionLines);
    const tags = [];

    for (const label of doc.tags) {
        tags.push({ name: "tag", value: label });
    }

    for (const category of doc.state.categories) {
        tags.push({ name: "category", value: category });
    }

    for (const group of doc.state.groups) {
        tags.push({ name: "group", value: group });
    }


    if (doc.state.since) {
        tags.push({ name: "since", value: doc.state.since });
    }

    if (doc.state.deprecated) {
        tags.push({
            name: "deprecated",
            value: doc.state.deprecated.version,
            description: doc.state.deprecated.description || null,
        });
    }

    if (doc.state.unreleased) {
        tags.push({ name: "unreleased", value: true });
    }

    if (doc.state.event) {
        tags.push({ name: "event", value: true });
    }

    for (const value of doc.state.extends) {
        tags.push({ name: "extends", value });
    }

    for (const realm of doc.realms) {
        tags.push({ name: realm, value: true });
    }

    for (const external of doc.externals) {
        tags.push({ name: "external", value: `${external.name} ${external.url}` });
    }

    for (const alias of doc.state.aliases) {
        tags.push({ name: "alias", value: alias });
    }

    for (const include of doc.state.includes) {
        tags.push({ name: "include", value: include });
    }

    for (const snippet of doc.state.snippets) {
        tags.push({ name: "snippet", value: snippet });
    }

    if (doc.state.inheritDoc) {
        tags.push({ name: "inheritDoc", value: doc.state.inheritDoc });
    }

    if (Array.isArray(doc.customTags)) {
        for (const custom of doc.customTags) {
            if (!custom || !custom.name) {
                continue;
            }
            const entry = { name: custom.name };
            const hasValue = custom.value !== null && custom.value !== undefined && custom.value !== "";
            const desc = Array.isArray(custom.description)
                ? custom.description.join("\n").trim()
                : "";
            if (hasValue) {
                entry.value = custom.value;
            } else if (!desc) {
                entry.value = true;
            } else {
                entry.value = "";
            }
            if (desc) {
                entry.description = desc;
            }
            tags.push(entry);
        }
    }

    return {
        summary,
        descriptionMarkdown,
        tags,
        examples: [],
    };
}

function resolveTypeTag(doc) {
    if (doc.typeTags.length === 0) {
        return null;
    }

    return doc.typeTags[0];
}

function findNextBindingLine(lines, startIndex, blockByStart) {
    let index = startIndex;

    while (index < lines.length) {
        if (blockByStart.has(index)) {
            const block = blockByStart.get(index);
            index = block.endLine;
            continue;
        }

        const line = lines[index];
        if (line.trim().length === 0) {
            index += 1;
            continue;
        }

        if (line.trim().startsWith("--")) {
            index += 1;
            continue;
        }

        return { line, lineNumber: index + 1 };
    }

    return null;
}

function buildSymbolsForBlock(doc, block, binding, filePath, relativePath, diagnostics, classNames, fileWithinDefault, fileWithinRequire) {
    const symbols = [];
    const typeTag = resolveTypeTag(doc);
    let kind = null;
    let name = null;
    let within = doc.state.within || null;
    let isMethod = false;

    if (typeTag) {
        kind = typeTag.kind;
        name = typeTag.name || null;
        if (kind === "property") {
            kind = "property";
        }
        if (typeTag.kind === "function") {
            kind = "function";
            isMethod = Boolean(typeTag.isMethod);
        }
        if (typeTag.kind === "constructor") {
            kind = "constructor";
            isMethod = false;
        }
        if (!name && binding) {
            name = binding.name || null;
            within = within || binding.within || null;
            if (binding.isMethod !== undefined) {
                isMethod = Boolean(binding.isMethod) || isMethod;
            }
        }
    } else if (binding) {
        kind = binding.kind;
        name = binding.name || null;
        within = within || binding.within || null;
        isMethod = Boolean(binding.isMethod);
    }

    const inferredKind = kind || (binding ? binding.kind : null);
    const needsWithin = inferredKind === "function" || inferredKind === "property" || inferredKind === "constructor";

    if (!within && binding && binding.within) {
        within = binding.within;
    }

    const allowAutoWithin = !fileWithinRequire;

    if (!within && needsWithin) {
        if (fileWithinDefault) {
            within = fileWithinDefault;
        } else if (allowAutoWithin && classNames && classNames.length > 0) {
            within = classNames[0];
        }
    }

    if (kind === "function" && name === "new" && within && !isMethod) {
        kind = "constructor";
    } else if (kind === "function" && isMethod) {
        kind = "method";
    }

    if (!within && needsWithin && classNames) {
        diagnostics.push({
            level: classNames.length === 0 ? "error" : "warning",
            file: relativePath,
            line: block.startLine,
            message: classNames.length === 0
                ? "@class missing for this file."
                : "@within missing for ambiguous class ownership.",
        });
    }

    if (!kind || !name) {
        return symbols;
    }

    if (doc.state.readonly && kind !== "property") {
        diagnostics.push({
            level: "warning",
            file: relativePath,
            line: block.startLine,
            message: "@readonly used on non-property symbol.",
        });
    }

    const locationLine = binding ? binding.lineNumber : block.startLine;
    const locationLineContent = binding ? binding.line : linesAt(filePath, locationLine);
    const location = buildLocation(relativePath, locationLine, locationLineContent);

    const docs = buildDocs(doc);
    const visibility = doc.state.visibility || "public";
    const qualifiedName = buildQualifiedName(within, name, isMethod);

    let types = { display: "", structured: null };

    if (kind === "function" || kind === "constructor" || kind === "method" || kind === "event") {
        types = buildFunctionTypes(doc, binding);
    } else if (kind === "property") {
        types = buildPropertyTypes(doc, typeTag ? typeTag.type : null);
    } else if (kind === "interface") {
        types = buildInterfaceTypes(doc);
    } else if (kind === "type") {
        types = buildTypeTypes(doc, binding);
    } else if (kind === "class") {
        types = buildClassTypes(doc);
    }

    symbols.push({
        kind,
        name,
        qualifiedName,
        location,
        docs,
        types,
        visibility,
    });

    if (kind === "type" && binding && binding.typeFields) {
        for (const field of binding.typeFields) {
            if (!field.name) {
                continue;
            }

            const fieldLocation = field.line
                ? buildLocation(relativePath, field.line, linesAt(filePath, field.line))
                : location;
            const fieldQualified = `${name}.${field.name}`;

            symbols.push({
                kind: "field",
                name: field.name,
                qualifiedName: fieldQualified,
                location: fieldLocation,
                docs: {
                    summary: field.description || "",
                    descriptionMarkdown: field.description || "",
                    tags: [],
                    examples: [],
                },
                types: {
                    display: field.type || "",
                    structured: { type: field.type || null },
                },
                visibility,
            });
        }
    }

    if (kind === "interface") {
        for (const field of doc.fields) {
            if (!field.name) {
                continue;
            }

            const fieldName = field.name;
            const fieldQualified = `${name}.${fieldName}`;
            symbols.push({
                kind: "field",
                name: fieldName,
                qualifiedName: fieldQualified,
                location,
                docs: {
                    summary: field.description || "",
                    descriptionMarkdown: field.description || "",
                    tags: [],
                    examples: [],
                },
                types: {
                    display: field.type || "",
                    structured: { type: field.type || null },
                },
                visibility,
            });
        }
    }

    return symbols;
}

function linesAt(filePath, lineNumber) {
    try {
        const content = fs.readFileSync(filePath, "utf8");
        const lines = content.split(/\r?\n/);
        return lines[lineNumber - 1] || "";
    } catch (error) {
        return "";
    }
}

function applyInheritDocs(symbols) {
    const map = new Map();
    for (const symbol of symbols) {
        map.set(symbol.qualifiedName, symbol);
    }

    for (const symbol of symbols) {
        const inheritTag = symbol.docs.tags.find((tag) => tag.name === "inheritDoc");
        if (!inheritTag || !inheritTag.value) {
            continue;
        }

        const target = map.get(inheritTag.value);
        if (!target) {
            continue;
        }

        if (!symbol.docs.descriptionMarkdown && target.docs.descriptionMarkdown) {
            symbol.docs.descriptionMarkdown = target.docs.descriptionMarkdown;
            symbol.docs.summary = target.docs.summary;
        }

        if (!symbol.docs.tags.length && target.docs.tags.length) {
            symbol.docs.tags = target.docs.tags.slice();
        }

        if (!symbol.types.structured && target.types.structured) {
            symbol.types.structured = target.types.structured;
            symbol.types.display = target.types.display;
        }
    }
}

function generateModule(filePath, rootDir, srcDir, typesDir, moduleIdOverrides, diagnostics) {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split(/\r?\n/);
    const blocks = extractDocBlocks(lines);

    const blockByStart = new Map();
    for (const block of blocks) {
        blockByStart.set(block.startLine - 1, block);
    }

    const moduleSymbols = [];
    const classNames = [];
    let fileWithinDefault = null;
    let fileWithinRequire = false;
    const typeTableDeclarations = findTypeTableDeclarations(lines);
    const typeTableRanges = typeTableDeclarations.map((decl) => ({
        startLine: decl.startLine,
        endLine: decl.endLine,
    }));
    let currentClassName = null;



    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex += 1) {
        const block = blocks[blockIndex];
        const isInsideTypeTable = typeTableRanges.some((range) => block.startLine >= range.startLine && block.startLine <= range.endLine);
        if (isInsideTypeTable) {
            continue;
        }

        const doc = parseDocBlock(block.contentLines);
        if (shouldInferImplicitFileClass(lines, block, blockIndex, doc)) {
            const inferredClassName = inferClassNameFromFilePath(filePath);
            if (inferredClassName) {
                doc.typeTags.unshift({ kind: "class", name: inferredClassName });
            }
        }
        if (doc.state.hasWithinDefault) {
            fileWithinDefault = doc.state.withinDefault || null;
        }
        if (doc.state.hasWithinRequire) {
            fileWithinRequire = doc.state.withinRequire === true;
        }
        const isFileMeta = doc.state.fileMeta === true && doc.typeTags.length === 0;
        if (isFileMeta) {
            continue;
        }
        for (const tag of doc.typeTags) {
            if (tag.kind === "class" && tag.name) {
                if (!classNames.includes(tag.name)) {
                    classNames.push(tag.name);
                }
                currentClassName = tag.name;
            }
        }

        if (doc.state.within === "~" && currentClassName) {
            doc.state.within = currentClassName;
        }

        const typeTag = resolveTypeTag(doc);
        let binding = null;

        if (!typeTag || typeTag.kind === "function" || typeTag.kind === "type") {
            const next = findNextBindingLine(lines, block.endLine, blockByStart);
            if (next) {
                binding = parseBindingAt(lines, next.lineNumber - 1);
                if (binding) {
                    binding.line = next.line;
                    binding.lineNumber = next.lineNumber;
                }
                if (typeTag && typeTag.kind === "type" && binding && binding.kind !== "type") {
                    binding = null;
                }
                if (
                    typeTag &&
                    typeTag.kind === "type" &&
                    binding &&
                    binding.kind === "type" &&
                    typeTag.name &&
                    binding.name &&
                    typeTag.name !== binding.name
                ) {
                    binding = null;
                }
            }
        }

        const relativePath = normalizePath(path.relative(rootDir, filePath));
        const symbols = buildSymbolsForBlock(doc, block, binding, filePath, relativePath, diagnostics, classNames, fileWithinDefault, fileWithinRequire);
        moduleSymbols.push(...symbols);

        if (binding && (binding.kind === "function" || binding.kind === "constructor")) {
            const docParamNames = doc.params.map((param) => param.name);
            const bindingParamNames = resolveBindingParams(binding).map((param) => param.name);
            const hasExplicitParamType = doc.params.some((param) => {
                if (!param.type) {
                    return false;
                }
                const normalized = param.type.trim();
                return normalized.length > 0 && normalized !== "any";
            });

            if (hasExplicitParamType && docParamNames.length > 0) {
                const missing = bindingParamNames.filter((name) => !docParamNames.includes(name));
                const extra = docParamNames.filter((name) => !bindingParamNames.includes(name));

                if (missing.length > 0 || extra.length > 0) {
                    diagnostics.push({
                        level: "warning",
                        file: normalizePath(path.relative(rootDir, filePath)),
                        line: block.startLine,
                        message: "@param does not match function parameters.",
                    });
                }
            }
        }

        if (doc.returns.length > 0 && binding && binding.returnType) {
            if (doc.returns.length === 0) {
                diagnostics.push({
                    level: "warning",
                    file: normalizePath(path.relative(rootDir, filePath)),
                    line: block.startLine,
                    message: "@return must describe all return values when used.",
                });
            }
        }
    }

    const relativePath = normalizePath(path.relative(rootDir, filePath));
    const existingQualified = new Set(moduleSymbols.map((symbol) => symbol.qualifiedName));

    for (const decl of typeTableDeclarations) {
        if (!decl.name || !classNames.includes(decl.name)) {
            continue;
        }
        for (const field of decl.fields || []) {
            if (!field.name) {
                continue;
            }
            const qualifiedName = `${decl.name}.${field.name}`;
            if (existingQualified.has(qualifiedName)) {
                continue;
            }
            const fieldLocation = field.line
                ? buildLocation(relativePath, field.line, linesAt(filePath, field.line))
                : buildLocation(relativePath, decl.startLine, linesAt(filePath, decl.startLine));
            moduleSymbols.push({
                kind: "property",
                name: field.name,
                qualifiedName,
                location: fieldLocation,
                docs: {
                    summary: field.description || "",
                    descriptionMarkdown: field.description || "",
                    tags: [],
                    examples: [],
                },
                types: {
                    display: field.type || "",
                    structured: { type: field.type || null },
                },
                visibility: "public",
            });
            existingQualified.add(qualifiedName);
        }
    }

    applyInheritDocs(moduleSymbols);

    const rootRelativePath = normalizePath(path.relative(rootDir, filePath));
    const idOverride = moduleIdOverrides && moduleIdOverrides[rootRelativePath];
    let baseDir = rootDir;
    if (srcDir && normalizePath(filePath).startsWith(normalizePath(srcDir))) {
        baseDir = srcDir;
    } else if (typesDir && normalizePath(filePath).startsWith(normalizePath(typesDir))) {
        baseDir = typesDir;
    }

    const baseRelativePath = normalizePath(path.relative(baseDir, filePath));
    const moduleId = idOverride || baseRelativePath.replace(/\.[^/.]+$/, "");

    return {
        id: moduleId,
        path: rootRelativePath,
        sourceHash: sha1(content),
        symbols: moduleSymbols,
    };
}

function loadModuleOverrides(rootDir) {
    const configPath = path.join(rootDir, "docs.config.json");
    const config = readJsonIfExists(configPath);
    if (!config) {
        return null;
    }

    if (config.moduleIdOverrides && typeof config.moduleIdOverrides === "object") {
        return config.moduleIdOverrides;
    }

    return null;
}

function generate(options) {
    const rootDir = options.rootDir;
    const srcDir = options.srcDir;
    const typesDir = options.typesDir;
    const diagnostics = [];

    const moduleIdOverrides = loadModuleOverrides(rootDir);
    const files = new Set(collectFiles(srcDir));
    if (typesDir) {
        for (const file of collectFiles(typesDir)) {
            if (!files.has(file)) {
                files.add(file);
            }
        }
    }

    const modules = Array.from(files).map((filePath) =>
        generateModule(filePath, rootDir, srcDir, typesDir, moduleIdOverrides, diagnostics)
    );

    return {
        data: {
            schemaVersion: DEFAULT_SCHEMA_VERSION,
            generatorVersion: options.generatorVersion || "0.0.0",
            luauVersion: null,
            modules,
        },
        diagnostics,
    };
}

module.exports = {
    generate,
};
