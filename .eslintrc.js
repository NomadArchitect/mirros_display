module.exports = {
  root: true,

  env: {
    node: true,
    es2021: true,
  },

  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",
  },

  extends: [
    "plugin:vue/essential",
    "@vue/prettier",
    "@vue/prettier/recommended",
  ],
};
