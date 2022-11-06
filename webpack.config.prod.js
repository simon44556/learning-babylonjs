const { merge } = require("webpack-merge")

const common = require("./webpack.config.common")

module.exports = merge(common, {
  mode: "production",
  devtool: 'source-map',
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
})
