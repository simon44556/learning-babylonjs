const path = require("path");
const { merge } = require("webpack-merge");
const fs = require('fs');

const common = require("./webpack.config.common");

const appDirectory = fs.realpathSync(process.cwd());

module.exports = merge(common, {
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        static: path.resolve(appDirectory, "./dist"),
        compress: true,
        hot: true,
        // publicPath: '/',
        open: true,
        port: 9000,
        // host: '0.0.0.0', // enable to access from other devices on the network
        // https: true // enable when HTTPS is needed (like in WebXR)
    },
})
