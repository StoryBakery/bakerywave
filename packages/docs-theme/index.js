const path = require('path');

module.exports = function storybakeryDocsTheme() {
    return {
        name: 'storybakery-docs-theme',
        getThemePath() {
            return path.resolve(__dirname, 'theme');
        },
        getClientModules() {
            return [
                path.resolve(__dirname, 'css/theme.css'),
                path.resolve(__dirname, 'theme/Footer/styles.css'),
                path.resolve(__dirname, 'theme/SearchBar/styles.css'),
                path.resolve(__dirname, 'theme/LocaleDropdown/styles.css'),
                path.resolve(__dirname, 'theme/Navbar/styles.css'),
            ];
        },
    };
};
