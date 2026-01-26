const fs = require("fs");

const { normalizeOptions, generateReferenceDocs } = require("./generate");

function readJsonIfExists(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, "utf8");
  return { data: JSON.parse(raw), raw };
}

module.exports = function storybakeryReferencePlugin(context, opts = {}) {
  const siteDir = context.siteDir;

  return {
    name: "storybakery-reference",
    loadContent() {
      const options = normalizeOptions(siteDir, opts);
      return readJsonIfExists(options.input);
    },
    contentLoaded({ content }) {
      if (!content) {
        return;
      }
      generateReferenceDocs(siteDir, opts, content);
    },
  };
};
