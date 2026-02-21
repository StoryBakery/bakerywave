export default {
    guides: [
        {
            type: "category",
            label: "소개",
            collapsed: false,
            items: [
                "intro/what-is-bakerywave",
                "intro/installation",
            ],
        },
        {
            type: "category",
            label: "튜토리얼",
            collapsed: false,
            items: [
                "tutorial/create-site",
                "tutorial/run-server",
                "tutorial/write-manual",
                "tutorial/luau-api",
            ],
        },
        {
            type: "category",
            label: "가이드",
            items: [
                "guides/configuration",
                {
                    type: "category",
                    label: "번역 (i18n)",
                    items: [
                        "guides/translation",
                        "guides/translation/getting-started",
                        "guides/translation/initial-setup",
                        "guides/translation/document-workflow",
                        "guides/translation/reference-workflow",
                        "guides/translation/non-native-contribution",
                        "guides/translation/troubleshooting",
                    ],
                },
                "guides/cli",
                "guides/customization",
                {
                    type: "category",
                    label: "배포하기",
                    link: {
                        type: "doc",
                        id: "guides/deployment/index",
                    },
                    items: [
                        "guides/deployment/github-pages",
                        "guides/deployment/vercel",
                        "guides/deployment/netlify",
                    ],
                },
            ],
        },
        {
            type: "category",
            label: "Luau 문서화",
            items: [
                "luau-tags/overview",
                "luau-tags/supported-tags",
                "luau-tags/docgen-scripts",
                "luau-tags/best-practices",
            ],
        },
        {
            type: "category",
            label: "개발 기여",
            link: {
                type: "doc",
                id: "development/index",
            },
            items: [
                "development/getting-started",
                {
                    type: "category",
                    label: "테스트",
                    link: {
                        type: "doc",
                        id: "development/tests/index",
                    },
                    items: [
                        "development/tests/fixture",
                        "development/tests/scenarios",
                    ],
                },
                "development/style",
                "development/contributing",
                "development/release",
            ],
        },
    ],
    writing: [
        "writing/index",
        "writing/markdown",
        "writing/mdx",
        {
            type: "category",
            label: "React 컴포넌트",
            link: {
                type: "doc",
                id: "writing/react-components",
            },
            items: [
                "writing/react-components/alerts",
                "writing/react-components/accordion-tabs",
                "writing/react-components/layout-text",
                "writing/react-components/button-card",
                "writing/react-components/misc",
                "writing/react-components/reference-ui",
            ],
        },
        "writing/api-links",
    ],
    reference: [
        "reference/index",
        "reference/ui",
        "reference/behavior/index",
        "reference/pipeline",
        "reference/cli",
        {
            type: "category",
            label: "Generated API",
            collapsed: true,
            items: [
                "reference/luau/index",
            ],
        },
    ],
};
