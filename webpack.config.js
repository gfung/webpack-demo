const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const merge = require('webpack-merge');
const glob = require('glob');

const parts = require('./webpack.parts');

const PATHS = {
    app: path.join(__dirname, 'app'),
    build: path.join(__dirname, 'build'),
    style: [
        path.join(__dirname, 'node_modules/bootstrap/scss/','bootstrap.scss'),
        path.join(__dirname, 'app/','main.scss'),
    ],
};

const common = merge([
    {
		// Entry accepts a path or an object of entries.
		// We'll be using the latter form given it's
		// convenient with more complex configurations.
		//
		// Entries have to resolve to files! It relies on Node.js
		// convention by default so if a directory contains *index.js*,
		// it will resolve to that.
        entry: {
            app: PATHS.app,
            style: PATHS.style,
        },
        output: {
            path: PATHS.build,
            filename: '[name].js',
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: 'Webpack Hanzo',
            }),
        ],
    },
    parts.lintCSS(
		PATHS.app,
        {
            'color-hex-case': 'lower',
        }
	),
]);

module.exports = function (env) {
    if (env === 'production') {
        return merge([
            common,
            {
                output: {
                    chunkFilename: 'scripts/[chunkhash].js',
                    filename: '[name].[chunkhash].js',
                },
                plugins: [
                    new webpack.HashedModuleIdsPlugin(),
                ],
                recordsPath: 'records.json',
            },
            parts.setFreeVariable(
				'process.env.NODE_ENV',
				'production'
			),
            parts.clean(PATHS.build),
            parts.loadJavaScript(PATHS.app),
            parts.minifyJavaScript({ useSourceMap: true }),
			// parts.extractBundles([
			// 	{
			// 		name: 'vendor',
			// 		entries: ['react'],
			// 	},
			// 	{
			// 		name: 'manifest',
			// 	},
			// ]),
            parts.generateSourcemaps('source-map'),
            parts.lintJavaScript({ paths: PATHS.app }),
            parts.extractCSS(PATHS.style),
            parts.purifyCSS(
				glob.sync(path.join(PATHS.app, '*'))
			),
            parts.pugloader(PATHS.app)
        ]);
    }

    return merge([
        common,
        {
            plugins: [
                new webpack.NamedModulesPlugin(),
            ],
        },
        parts.generateSourcemaps('eval-source-map'),
        parts.loadCSS(PATHS.style),
        parts.devServer({
			// Customize host/port here if needed
            host: process.env.HOST,
            port: process.env.PORT,
        }),
        parts.lintJavaScript({
            paths: PATHS.app,
            options: {
				// Emit warnings over errors to avoid crashing
				// HMR on error.
                emitWarning: true,
            },
        }),
    ]);
};
