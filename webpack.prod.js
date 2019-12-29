const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  // disabled source mapping on prod
  // devtool: 'source-map'
});