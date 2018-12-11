const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const exclude = absPath => /node_modules/.test(absPath)
const mode = process.env.NODE_ENV || 'development'

const production = mode === 'production'

const wcl = require('./src/wcl')

module.exports = {
  mode,
  entry: './src/index.js',
  output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    chunkFilename: '[name].[chunkhash].js',
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  devtool: production ? false : 'eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(!production),
    }),

    new HtmlWebpackPlugin({
      // Create index.html file
      cache: production,
    }),
  ],
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.js$/,
        use: ['react-hot-loader/webpack'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          toplevel: true,
          mangle: true,
        },
      }),
    ],

    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/, // Create a vendor chunk with all the imported node_modules in it
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      react: path.resolve(path.join(__dirname, './node_modules/react')),
      'react-dom': path.resolve(
        path.join(__dirname, './node_modules/react-dom'),
      ),
      'react-hot-loader': path.resolve(
        path.join(__dirname, './node_modules/react-hot-loader'),
      ),
      'babel-core': path.resolve(
        path.join(__dirname, './node_modules/@babel/core'),
      ),
    },
  },
  bail: true, // Fail out on the first error instead of tolerating it
}
