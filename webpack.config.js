'use strict';

const path              = require('path');
const webpack           = require('webpack');
const UglifyJSPlugin    = require('uglifyjs-webpack-plugin');

module.exports = (config) => {

    let plugins  = [];
    let devtools = '';

    if (!config.dev) {
        plugins.push(new UglifyJSPlugin());
    } else {
        devtools = 'source-map';
    }

    let env = (config.dev) ? 'development' : 'production';

    plugins.push(new webpack.DefinePlugin({
        "process.env": {
            NODE_ENV: JSON.stringify(env)
        }
    }));


    return {
        target:  'node',
        entry:   {
            'app':  path.resolve(config.scripts.src),
            'core': path.resolve(config.core.src)
        },
        output:  {
            path:     path.resolve(config.scripts.dest),
            filename: '[name].js'
        },
        devtool: devtools,
        plugins: plugins,
        module:  {
            loaders: [
                {
                    test:    [/\.js$/, /\.es6$/, /\.jsx?S/],
                    loader:  'babel-loader',
                    exclude: /node_modules/,
                    query:   {
                        presets: ['react', 'es2015']
                    }
                }
            ]
        }
    };

};
