const path     = require('path')
module.exports = {
  mode   : 'development',
  entry  : {
    // Background scripts.
    'background/background.js': './src/background/background.ts',
    // Content scripts.
    'content/content.js'           : './src/content/contentscript.ts',
    'content/inpage.js'            : './src/content/inpage.ts',
    'content/signerTestMethods.js' : './src/content/signerTestMethods.ts'
  },
  devtool: 'inline-source-map',
  module : {
    rules: [
      {
        test   : /\.ts$/,
        use    : [{
          loader : 'ts-loader',
          options: {
            configFile: 'tsconfig.webpack.json'
          }
        }],
        include: path.resolve(__dirname, 'src')
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output : {
    path    : path.resolve(__dirname, 'build/scripts'),
    filename: '[name]'
  }
}
