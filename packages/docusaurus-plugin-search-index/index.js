const fs = require("fs");
const path = require("path");

/**
 * 문서 파일에서 frontmatter와 내용을 파싱합니다.
 */
function parseMarkdownFile(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    let title = "";
    let sidebarLabel = "";
    let body = content;

    if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
        const labelMatch = frontmatter.match(/^sidebar_label:\s*(.+)$/m);

        if (titleMatch) {
            title = titleMatch[1].trim().replace(/^["']|["']$/g, "");
        }
        if (labelMatch) {
            sidebarLabel = labelMatch[1].trim().replace(/^["']|["']$/g, "");
        }
        body = content.slice(frontmatterMatch[0].length);
    }

    return { title, sidebarLabel, body };
}

/**
 * 마크다운에서 검색 가능한 텍스트를 추출합니다.
 */
function extractSearchableText(markdown) {
    // HTML 태그 제거
    let text = markdown.replace(/<[^>]+>/g, " ");
    // 마크다운 링크 텍스트만 추출
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    // 코드 블록 제거
    text = text.replace(/```[\s\S]*?```/g, " ");
    // 인라인 코드 내용만 추출
    text = text.replace(/`([^`]+)`/g, "$1");
    // 헤딩 마크업 제거
    text = text.replace(/^#+\s*/gm, "");
    // 강조 마크업 제거
    text = text.replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1");
    // 연속 공백 정리
    text = text.replace(/\s+/g, " ").trim();

    return text;
}

/**
 * API 심볼 종류를 판별합니다.
 */
function getItemType(filePath, content) {
    const lowerPath = filePath.toLowerCase();

    // Reference 폴더 내의 클래스 파일
    if (lowerPath.includes("/reference/") && filePath.endsWith(".mdx")) {
        // 클래스 페이지인지 확인 (## Summary, ## Methods 등이 있으면 클래스)
        if (content.includes("## Summary") || content.includes("## Methods") || content.includes("## Properties")) {
            return "class";
        }
        // 함수/메서드 정의가 있는지 확인
        if (content.includes("function") || content.includes("->")) {
            return "function";
        }
        return "api";
    }

    return "doc";
}

/**
 * 카테고리 경로를 추출합니다.
 */
function extractCategory(filePath, docsDir) {
    const relative = path.relative(docsDir, filePath).replace(/\\/g, "/");
    const parts = relative.split("/");

    // 첫 번째 폴더가 섹션 (reference, guides 등)
    if (parts.length > 1) {
        const section = parts[0];
        if (section === "reference" && parts.length > 2) {
            // reference/luau/Docs/Features/... -> Docs/Features
            const categoryParts = parts.slice(2, -1);
            if (categoryParts.length > 0) {
                return categoryParts.join("/");
            }
        }
    }

    return "";
}

/**
 * 섹션을 문서 최상위 폴더명으로 판별합니다.
 */
function getSection(filePath, docsDir) {
    const relative = path.relative(docsDir, filePath).replace(/\\/g, "/");
    const parts = relative.split("/");

    if (parts.length > 1 && parts[0]) {
        return parts[0];
    }

    return "root";
}

/**
 * 디렉토리를 재귀적으로 탐색하여 문서 파일을 수집합니다.
 */
function collectDocs(dir, docsDir, entries = []) {
    if (!fs.existsSync(dir)) {
        return entries;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
        if (item.startsWith("_") || item.startsWith(".")) {
            continue;
        }

        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            collectDocs(fullPath, docsDir, entries);
        } else if (item.endsWith(".md") || item.endsWith(".mdx")) {
            const { title, sidebarLabel, body } = parseMarkdownFile(fullPath);
            const searchableText = extractSearchableText(body);
            const section = getSection(fullPath, docsDir);
            const category = extractCategory(fullPath, docsDir);
            const itemType = getItemType(fullPath, body);

            // URL 경로 생성
            const relative = path.relative(docsDir, fullPath).replace(/\\/g, "/");
            let urlPath = "/" + relative.replace(/\.(md|mdx)$/, "");
            if (urlPath.endsWith("/index")) {
                urlPath = urlPath.slice(0, -6) || "/";
            }

            entries.push({
                id: relative,
                title: title || sidebarLabel || item.replace(/\.(md|mdx)$/, ""),
                url: urlPath,
                section,
                category,
                type: itemType,
                excerpt: searchableText.slice(0, 200),
                content: searchableText,
            });
        }
    }

    return entries;
}

/**
 * 검색 인덱스를 생성합니다.
 */
function buildSearchIndex(siteDir, options = {}) {
    const docsDir = path.resolve(siteDir, options.docsPath || "docs");
    const outDir = path.resolve(siteDir, options.outDir || ".generated");
    const outFile = path.join(outDir, "search-index.json");

    const entries = collectDocs(docsDir, docsDir);

    // 섹션 및 카테고리 목록 추출
    const sections = [...new Set(entries.filter((entry) => entry.section).map((entry) => entry.section))].sort();
    const categories = [...new Set(entries.filter((entry) => entry.category).map((entry) => entry.category))].sort();

    const index = {
        version: "1.0",
        generatedAt: new Date().toISOString(),
        sections,
        categories,
        entries,
    };

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(outFile, JSON.stringify(index, null, 2), "utf8");

    return { entries: entries.length, outFile };
}

module.exports = function searchIndexPlugin(context, opts = {}) {
    const siteDir = context.siteDir;
    const docsDir = path.resolve(siteDir, opts.docsPath || "docs");

    return {
        name: "storybakery-search-index",

        getPathsToWatch() {
            return [
                path.join(docsDir, "**/*.md"),
                path.join(docsDir, "**/*.mdx"),
            ];
        },

        async postBuild() {
            const result = buildSearchIndex(siteDir, opts);
            console.log(`[storybakery] 검색 인덱스 생성: ${result.entries}개 문서 -> ${result.outFile}`);
        },

        // 개발 서버에서도 인덱스 생성
        async loadContent() {
            const result = buildSearchIndex(siteDir, opts);
            return result;
        },
    };
};

module.exports.buildSearchIndex = buildSearchIndex;
