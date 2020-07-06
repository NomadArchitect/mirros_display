module.exports = {
  runtimeCompiler: true,
  publicPath: process.env.NODE_ENV === "production" ? "/display/" : "/",
  chainWebpack: (config) => {
    const svgRule = config.module.rule("svg");

    // clear all existing loaders.
    // if you don't do this, the loader below will be appended to
    // existing loaders of the rule.
    svgRule.uses.clear();

    // add replacement loader(s)
    svgRule
      .oneOf("external")
      .resourceQuery(/external/)
      .use("file-loader")
      .loader("file-loader")
      .options({ name: "assets/[name].[hash:8].[ext]" })
      .end()
      .end()
      .oneOf("inline")
      .use("vue-svg-loader")
      .loader("vue-svg-loader")
      .options({
        svgo: {
          plugins: [
            // See https://github.com/svg/svgo for options
            { removeViewBox: false },
            { removeDimensions: true },
            { convertColors: { currentColor: true } },
          ],
        },
      });
  },
};
