const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

console.log("Hello from webpack.config.js");

module.exports = {
  entry: './src/renderer.js',  // Entry point for the renderer process
  output: {
    path: path.resolve(__dirname, 'dist'),  // Output to the dist folder
    filename: 'renderer.bundle.js',  // Bundle name for the renderer
  },
  module: {
    rules: [
      {
        test: /\.js$/,  // Use Babel loader for JavaScript files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "./index.html", to: "" },  // Copy HTML to dist folder
      ],
    }),
  ],
  target: 'electron-renderer',  // Ensures compatibility with Electron
};
