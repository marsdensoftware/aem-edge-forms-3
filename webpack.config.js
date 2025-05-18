/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
let commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim(); // N.B. this will be the hash of the previous commit

module.exports = {
  experiments: {
    outputModule: true,
  },
  entry: './blocks/react-search/react-search.jsx',
  mode: 'development',
  target: 'web',
  output: {
    filename: 'react-search.js',
    path: path.resolve(__dirname, 'blocks', 'react-search'),
    clean: false,
    library: {
      type: 'module',
    },
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({
      raw: true,
      banner: '/* eslint-disable */',
    }),
    new webpack.DefinePlugin({
      __COMMIT_HASH__: JSON.stringify(commitHash)
    }),
  ],
};
