const path = require('path');
const webpack = require('webpack');

module.exports = {
    context: path.resolve(__dirname, 'src'),

    entry: [
        './index.tsx'
        // the entry point of our app
    ],
    output: {
        filename: 'bundle.js',
        // the output bundle

        path: path.resolve(__dirname, 'dest'),

        publicPath: '/'
        // necessary for HMR to know where to load the hot update chunks
    },

    devtool: 'inline-source-map',

    devServer: {
        hot: true,
        // enable HMR on the server

        contentBase: path.resolve(__dirname, 'dest'),
        // match the output path

        publicPath: '/'
        // match the output `publicPath`
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'] 
    },
    module: {
        rules: [
            {test: /\.(ts|tsx)$/, use: ['ts-loader']}
        ]
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
    ]
};