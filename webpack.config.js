/*
 * @author alikr
 * https://github.com/alikr
 */

const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpackMerge = require('webpack-merge');

const config = {
  entry: {
    'index': './src/index'
  },
  output: {
    path: './dist',
    filename: 'js/[name].js',
    chunkFilename: 'js/[id].js',
    publicPath: ''
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'index',
      template: path.join(__dirname, '/src/index.html'),
      filename: path.join(__dirname, '/dist/index.html'),
      excludeChunks: [],
      inject: true,
      hash: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    }),
    new ExtractTextPlugin({
      filename: 'css/[name].css',
      disable: false,
      allChunks: true
    })
  ],
  module: {
    rules: [
    {
      test: /\.(js|es6)$/,
      loader: 'babel-loader',
      exclude: /node_module/
    },
    {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: 'css-loader'
      })
    }]
  },
  resolve: {
    modules: [
      path.join(__dirname, "src"),
      "node_modules"
    ],
    alias: {}
  }
}

module.exports = function(env) {
  return env == 'prod' ? webpackMerge(config, {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        mangle: {
          screw_ie8: true,
          keep_fnames: true
        },
        compress: {
          screw_ie8: true,
          warnings: false,
          drop_console: true,
          drop_debugger: true,
          dead_code: true
        },
        comments: false
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(env)
      }),
    ]
  }) : config;
};
