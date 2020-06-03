const merge = require('webpack-merge');
const path = require('path');
const _ = require('lodash');


// launch command npm run build-plugin -- --env.plugin='commands'

module.exports = (env = {}) => {

  console.log('env', env)
  let { plugin, filename } = env;

  if (_.isEmpty(filename)) {
    filename = plugin + '.js';
  }


  // TODO check plugin name and directory



  return {
    //mode: 'production',
    //devtool: 'eval-source-map',
    mode: 'production',
    entry: `./plugins/${plugin}/index.js`,
    output: {
      filename,
      //path: path.resolve(__dirname, 'plugins/commands/dist'),
      path: path.resolve(__dirname, 'dist-plugins'),
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
        'react-ace': 'amd react-ace'
      },
      /components/i
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
        },
        {
          test: require.resolve('./src/components/index.js'),
          use: 'exports-loader?CollectionEditor,HelpElements,withConfigurationPage,ContentAutocomplete',
        }
      ]
    }
  };
};