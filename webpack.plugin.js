  const merge = require('webpack-merge');
  //const common = require('./webpack.common.js');
  const path = require('path');

  module.exports = {
    //mode: 'production',
    //devtool: 'eval-source-map',
    mode: 'development',
    entry: './plugins/commands',
    output: {
      filename: 'commands.js',
      path: path.resolve(__dirname, 'dist-plugins'),
      library: 'Commands',
      libraryTarget: 'amd'
    },
    externals : [
      {
        rsuite: 'amd rsuite',
        react: 'amd react',
        'react-dom': 'amd react-dom',
        lodash: 'amd lodash',
        classnames: 'amd classnames',
        moment: 'amd moment',
        'prop-types': 'amd prop-types',
        'code-plug': 'amd code-plug',
        'react-apollo': 'amd react-apollo',
        'graphql-tag': 'amd graphql-tag',
        'react-router-dom': "amd react-router-dom",
        "react-sortable-hoc": "amd react-sortable-hoc",
        'ace-builds': 'amd ace-builds',
        'codemirror': 'amd codemirror',
        'marked': 'amd marked',
        'react-ace': 'amd react-ace',
        'app-context': 'amd app-context'
      }
      /*,
      function(context, request, callback) {
        if (/app\-context/.test(request)) {
          console.log('sahre app context')
          return callback(null, ['@/src/common/app-context', 'app-context'], 'amd');
        }
        callback();
      },*/
    ],
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-react'],
              plugins: [
                '@babel/plugin-proposal-class-properties'
              ]
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
          ]
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [
            'file-loader'
          ]
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            'style-loader',
            // Translates CSS into CommonJS
            'css-loader',
            // Compiles Sass to CSS
            'sass-loader'
          ]
        }
      ]
    },

    devServer: {
      contentBase: './dist',
      port: 8081,
      //publicPath: './src/images',
      //hot: true,
      /*proxy: {
        '*.png': {
          target: 'http://localhost:[port]/',
          //pathRewrite: { '^/some/sub-path': '' },
        }
      }*/
    }
  };