const { ProvidePlugin } = require("webpack");
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      return {
        ...webpackConfig,
        resolve: {
          ...webpackConfig.resolve,
          fallback: {
            ...(webpackConfig.resolve?.fallback ?? {}),
            path: require.resolve("path-browserify"),
            stream: require.resolve("stream-browserify"),
            buffer: require.resolve("buffer/"),
            crypto: require.resolve("crypto-browserify"),
          },
        },
        plugins: [
          ...(webpackConfig.plugins ?? []),
          new ProvidePlugin({
            Buffer: ["buffer", "Buffer"],
          }),
          new ProvidePlugin({
            process: "process/browser",
          }),
        ],
      };
    },
  },
};
