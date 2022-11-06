const path = require("path");
const fs = require("fs");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
  entry: path.resolve(appDirectory, "src/App.ts"),
  output: {
    path: path.resolve(appDirectory, "./dist"),
    filename: '[name].[contenthash].js',
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
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
      {
          test: /\.tsx?$/,
          loader: "ts-loader",
          // sideEffects: true
      },
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
    
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: "!!handlebars-loader!src/index.hbs",
    }),
  ],
}
