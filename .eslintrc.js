module.exports = {
  root: true,

  env: {
    node: true,
  },

  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",
  },

  parserOptions: {
    parser: "@babel/eslint-parser",
  },

  extends: [
    "plugin:vue/essential",
    "@vue/prettier",
    "@vue/eslint-config-prettier",
  ],
};
