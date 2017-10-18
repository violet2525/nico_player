module.exports = {
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['transform-react-jsx'],
        },
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader?modules'],
      },
    ],
  },
  entry: './src/app/index.js',
  output: {
    path: __dirname,
    filename: 'src/bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};