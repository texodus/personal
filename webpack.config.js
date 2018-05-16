
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = {
    plugins: [
        // new UglifyJSPlugin({
        //     sourceMap: true,
        //     uglifyOptions: {
        //         sourceMap: true,
        //         ecma: 5
        //     }
        // }),
        new HtmlWebpackPlugin({
            template: "index.html",
            inject: "head",
            inlineSource: '.*' // embed all javascript and css inline
        }),
        new HtmlWebpackInlineSourcePlugin()
    ],
    devtool: 'source-map',
    node: {
        fs: "empty"
    },
    entry: './js/app.js',
    mode: "production",
    output: {
        path: path.resolve(__dirname) + "/out"
    },
    module: {
        rules: [{
            test: /\.(png|jpeg|ttf|woff2|...)$/,
            use: [
                { loader: 'base64-inline-loader' } 
            ]
        }, {
            test: /\.css$/,
            use: [
                {loader: "style-loader"},
                {loader: "css-loader"}
            ]
        }, {
            test: /\.less$/,
            use: [
                {loader: "style-loader"},
                {loader: "css-loader"},
                {loader: "less-loader"}
            ]
        }, {
            test: /\.js$/,
            exclude: /node_modules|psp\.js/,
            loader: "babel-loader",
            options: {
                presets: ['env'],
                plugins: ['transform-runtime', ["transform-es2015-for-of", {
                    "loose": true
                }]]
            }
        }]
    }
};
