const path = require("path")
const CopyPlugin = require("copy-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: '[name].[contenthash].js',
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".glsl"],
    fallback: {
      fs: false,
      path: false, // require.resolve("path-browserify")
    },
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
      },
      {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          loader: "source-map-loader",
          enforce: "pre",
      },
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.(glsl|vs|fs)$/,
        loader: "ts-shader-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif|env|glb|gltf|stl)$/i,
        use: [
            {
                loader: "url-loader",
                options: {
                    limit: 8192,
                },
            },
        ],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
        patterns: [
            { from: "public" },
        ],
    }),
    new HtmlWebpackPlugin({
      template: "!!handlebars-loader!src/index.hbs",
    }),
  ],
}
