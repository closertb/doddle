module.exports = {
  extends: [
    'eslint-config-airbnb-base/rules/best-practices',
    'eslint-config-airbnb-base/rules/errors',
    'eslint-config-airbnb-base/rules/style',
    'eslint-config-airbnb-base/rules/variables',
    '../rules/base',
  ].map(require.resolve),
  rules: {},
  globals: {
    document: false,
    Prism: false,
    fetch: false,
    window: false,
    location: false,
    editormd: false,
    FormData: false,
    FileReader: false,
    localStorage: false,
    $: false,
  },
};
