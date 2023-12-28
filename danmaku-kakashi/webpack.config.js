const path = require('path');

module.exports = {
    entry: './src/index.js',
    mode: 'production',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: ['file-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.*', '.js', '.jsx']
    },
    output: {
        filename: 'content.js',
        path: path.resolve(__dirname, '..', 'extension')
    }
};