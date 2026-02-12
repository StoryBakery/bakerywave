const path = require("path");

const repository = process.env.GITHUB_REPOSITORY || "storybakery/bakerywave";
const [organizationName, projectName] = repository.split("/");
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

module.exports = {
    title: "Bakerywave",
    tagline: "StoryBakery documentation",
    url: `https://${organizationName}.github.io`,
    baseUrl: isGitHubActions ? `/${projectName}/` : "/",
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
                { type: "docSidebar", sidebarId: "manual", label: "Manual" },
                { type: "docSidebar", sidebarId: "reference", label: "Reference" },
            ],
        },
    },
};
