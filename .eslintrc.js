module.exports = {
  root: true,

  env: {
    node: true,
    es2021: true,
  },

  rules: {
    "no-console": import.meta.env.PROD ? "error" : "off",
    "no-debugger": import.meta.env.PROD ? "error" : "warn",
  },

  extends: [
    "plugin:vue/essential",
    "@vue/prettier",
    "@vue/prettier/recommended",
  ],
};
