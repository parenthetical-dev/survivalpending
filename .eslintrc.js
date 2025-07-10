module.exports = {
  root: true,
  extends: ["@survivalpending/config/eslint-preset.js"],
  settings: {
    next: {
      rootDir: ["apps/*/", "packages/*/"],
    },
  },
};