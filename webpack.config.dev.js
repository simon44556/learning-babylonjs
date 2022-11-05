const path = require("path")
const { merge } = require("webpack-merge")

const common = require("./webpack.config.common")

module.exports = merge(common, {
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        static: path.resolve(__dirname, "./dist"),
        compress: true,
        hot: true,
        // publicPath: '/',
        open: true,
        port: 9000,
        // host: '0.0.0.0', // enable to access from other devices on the network
        // https: true // enable when HTTPS is needed (like in WebXR)
    },
})
