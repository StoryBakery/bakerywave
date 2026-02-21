const path = require("path");

module.exports = {
    title: "StoryBakery Docs Template Test",
    url: "https://example.invalid",
    baseUrl: "/",
    i18n: {
        defaultLocale: "en",
        locales: ["en", "ko"],
    },
    organizationName: "storybakery",
    projectName: "docs-template",
    onBrokenLinks: "throw",
    onBrokenAnchors: "throw",
    markdown: {
        hooks: {
            onBrokenMarkdownLinks: "throw",
        },
    },
    presets: [
        [
            "@storybakery/docs-preset",
            {
                docs: {
                    path: "docs",
                    routeBasePath: "/",
                    sidebarPath: path.resolve(__dirname, "sidebars.js"),
                },
                i18n: {
                    defaultLocale: "en",
                    locales: ["en", "ko"],
                },
                robloxLinks: {
                    localCategories: {
                        AnotherCategory: {
                            basePath: "/reference/luau",
                        },
                    },
                },
                theme: {
                    customCss: path.resolve(__dirname, "src/css/custom.css"),
                },
            },
        ],
    ],
    themeConfig: {
        colorMode: {
            defaultMode: "light",
            respectPrefersColorScheme: true,
        },
        navbar: {
            title: "Docs Template Test",
            items: [
                { type: "docSidebar", sidebarId: "manual", label: "Manual" },
                { type: "docSidebar", sidebarId: "reference", label: "Reference" },
            ],
        },
    },
};
