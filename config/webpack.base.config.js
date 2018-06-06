'use strict';

const webpack = require('webpack');
const path = require('path');
const config = require('../package.json');
const basePath = path.join(__dirname, '../');

module.exports = {
    entry: {
        app: path.join(basePath, 'ts/index.ts')
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            images: path.join(basePath, 'example/images/'),
        },
    },
    externals: [
        'phaser'
    ],
    plugins: [
        new webpack.DefinePlugin({}),
    ],
    module: {
        rules: [
            {
                test: /images(\/|\\)/,
                loader: 'file-loader?name=images/[hash].[ext]',
            },
            {
                test: [ /\.vert$/, /\.frag$/ ],
                use: 'raw-loader'
            }
        ],
    },
};
