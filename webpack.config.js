const path = require('path');

module.exports = {
    entry: {
        shared: './client/shared.jsx',
        main: './client/main.jsx',
        login: './client/login.jsx',
        account: './client/account.jsx',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
        ],
    },
    mode: 'production',
    watchOptions: {
        aggregateTimeout: 200,
    },
    output: {
        path: path.resolve(__dirname, 'hosted'),
        filename: '[name]Bundle.js',
    },
    // Used https://webpack.js.org/plugins/split-chunks-plugin
    // This splits bundles into chunks, allowing shared.jsx to remain seperate (instead of being copied into ALL of the other bundles)
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
};