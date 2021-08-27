const path = require('path');

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    return {
      mode: 'development',
      entry: './src/index.js',
      output: {
        filename: 'main.js',
        path: path.resolve(__dirname, './dist'),
      },
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: 'babel-loader'
          },
        ]
      },

      // TODO: figure out better source maps
      devtool: 'eval-cheap-source-map',

      devServer: {
        port: 3000
      }
    };
  }
  if (argv.mode === 'production') {
    return {
      mode: 'production',
      entry: "./src/CustomStyle.js",
      output: {
        filename: "main.js",
        path: __dirname,
        libraryTarget: "commonjs"
      },
      /* uncomment if you are using react for your style */
      // module: {
      //   rules: [
      //     {
      //       test: /\.(js|jsx)$/,
      //       exclude: /node_modules/,
      //       use: 'babel-loader'
      //     },
      //   ]
      // },
      externals: {
        react: 'react'
      }
    }
  }
}