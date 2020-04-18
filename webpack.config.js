const path = require('path');

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'html-canvas-img-resizer.min.js',
    path: path.resolve(__dirname, 'browser'),
    libraryTarget: 'var',
    library: 'htmlCanvasImgResizer',
  },
};
