const path = require( 'path' );

module.exports = {
    entry: './src/center-meeting/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve( __dirname, 'dist/js/center-meeting' ),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [ "@babel/preset-react" ]
                    }
                }
            }
        ]
    }
};
