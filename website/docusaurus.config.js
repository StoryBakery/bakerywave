const path = require("path");

const repository = process.env.GITHUB_REPOSITORY || "storybakery/bakerywave";
const [organizationName, projectName] = repository.split("/");
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

module.exports = {
    title: "Bakerywave",
    tagline: "StoryBakery documentation",
    url: `https://${organizationName}.github.io`,
    baseUrl: isGitHubActions ? `/${projectName}/` : "/",
    i18n: {
        defaultLocale: "ko",
        locales: ["ko", "en"],
    },
    organizationName,
    projectName,
    onBrokenLinks: "warn",
    markdown: {
        hooks: {
            onBrokenMarkdownLinks: "warn",
            onBrokenMarkdownImages: "warn",
        },
    },
    presets: [
        [
            "@storybakery/docs-preset",
            {
                docs: {
                    path: "docs",
                    routeBasePath: "/",
                    sidebarPath: path.resolve(__dirname, "sidebars.ts"),
                },
                i18n: {
                    defaultLocale: "ko",
                    locales: ["ko", "en"],
                },
                reference: false,
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
            title: "Bakerywave",
            items: [
                { type: "docSidebar", sidebarId: "guides", label: "Docs" },
                { type: "docSidebar", sidebarId: "writing", label: "Writing" },
                { type: "docSidebar", sidebarId: "reference", label: "Reference" },
            ],
        },
    },
};
