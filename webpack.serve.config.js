let path = require('path');
let resources = require('./scripts/webpack-resources');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const postcssPresetEnv = require('postcss-preset-env');

const ROOT_PATH = path.resolve(__dirname);
const APP_PATH = path.resolve(ROOT_PATH, 'src');

const svgDirs = [
  path.resolve(__dirname, 'src/assets/svg-icons'), // 自己私人的 svg 存放目录
];

// const endpoints = {
//     "test": 'http://someapp.com:7000',
//     "test2": 'http://test2.someapp.com:7000',
//     "web2": 'http://web2.someapp.com:7000',
//     "local": 'http://127.0.0.1:4000',
//     "online": 'https://someapp.com/',
// };

const HMR_MODE_NONE = process.env.HMR === 'none';
const isProduction = process.env.NODE_ENV === 'production';
const devServerConfig = (env) => {
  //   const { DEPLOY_ENV = 'local' } = env;

  //   const endpoint = endpoints[DEPLOY_ENV];

  //   console.log('endpoint', endpoint);
  //   const proxySetting = {};
  //   const commonProxy = {
  //     target: endpoint,
  //     secure: false,
  //   };
  //   if (DEPLOY_ENV === 'online') {
  //     commonProxy['changeOrigin'] = true;
  //   }
  //   proxySetting['/passport/**'] = commonProxy;
  //   proxySetting['/web/**'] = commonProxy;
  //   proxySetting['/static/**'] = commonProxy;
  //   proxySetting['/hub/**'] = {
  //     target: 'http://127.0.0.1:3010',
  //   };

  return {
    // inline: true,
    // hot: !HMR_MODE_NONE,
    hot: true,
    host: '0.0.0.0',
    // disableHostCheck: true,
    compress: false,
    // watchOptions: {
    // //   ignored: /node_modules\/(?!@q7)/,
    //   // for windows hot load
    //   poll: 1233
    // },
    port: 3020,
    // stats: {
    //   progress: true,
    //   colors: true,
    //   assets: true,
    //   version: true,
    //   hash: true,
    //   timings: true,
    //   chunks: false,
    //   chunkModules: false,
    //   warnings: false,
    // },
    // proxy: proxySetting,
  };
};

const outputConfig = {
  publicPath: '/',
  filename: 'js/[name].js',
  chunkFilename: 'js/[name].js',
};

module.exports = (env) => {
  return resources.createServeConfig({
    entry: {
      app: ['./src/main/index'],
    },

    output: outputConfig,

    devtool: 'source-map',
    // devtool: "cheap-module-source-map",
    // cheap-module-source-map

    devServer: devServerConfig(env),

    stats: {
      //   progress: true,
      colors: true,
      assets: true,
      version: true,
      hash: true,
      timings: true,
      chunks: false,
      chunkModules: false,
      warnings: false,
    },

    externals: {},

    module: {
      rules: [
        {
          test: /\.css$/,
          // include: [ path.resolve('src') ],
          use: [
            'css-hot-loader',
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: function () {
                  return [
                    postcssPresetEnv({
                      stage: 0,
                    }),
                    require('autoprefixer'),
                  ];
                },
              },
            },
          ],
        },
        {
          test: /\.scss$/,
          enforce: 'pre',
          exclude: [/node_modules/],
          use: [
            'style-loader',
            {
              loader: 'css-loader', // translates CSS into CommonJS
              options: {
                modules: true,
                importLoaders: 2,
                localIdentName: isProduction ? undefined : '[name]_[local]_[hash:base64:5]',
                minimize: false,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: function () {
                  return [require('autoprefixer')];
                },
              },
            },
            {
              loader: 'sass-loader',
            },
          ],
        },
        // {
        // 	test: [ /\.tsx?$/ ],
        // 	use: [
        // 		// { loader: 'react-hot-loader/webpack' },
        // 		{
        // 			loader: 'babel-loader',
        // 			options: {
        // 				babelrc: false,
        // 				presets: [
        // 					"@babel/preset-typescript"
        // 				],
        // 				plugins: [
        // 					'@babel/plugin-syntax-dynamic-import',
        // 					'extract-hoc/babel',
        // 					// N.B: 用了babel-loader 必须用"react-hot-loader/babel"才能让代码跑起来，不然会报错。。
        // 					"react-hot-loader/babel",
        // 				]
        // 			}
        // 		},
        // 		{
        // 			loader: 'ts-loader',
        // 			options: {
        // 				happyPackMode: true,
        // 				experimentalWatchApi: true,
        // 				transpileOnly: true // IMPORTANT! use transpileOnly mode to speed-up compilation
        // 			}
        // 		}
        // 	],
        // 	exclude: [ /node_modules/, /\.scss.ts$/, /\.test.tsx?$/ ]
        // },
        {
          test: /\.(woff|woff2|eot|ttf)(\?.*$|$)/,
          use: ['url-loader'],
        },
        {
          test: /\.(svg)$/i,
          use: ['svg-sprite-loader'],
          include: svgDirs, // 把 svgDirs 路径下的所有 svg 文件交给 svg-sprite-loader 插件处理
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          use: ['url-loader?limit=8192&name=images/[hash:8][name].[ext]'],
          exclude: svgDirs,
        },
        // {
        //     test: /\.(graphql|gql)$/,
        //     exclude: /node_modules/,
        //     use: [
        //         {
        //             loader: 'graphql-tag/loader'
        //         }
        //     ]
        // }
      ].filter((v) => v),
    },

    plugins: [
      new HtmlWebpackPlugin({
        filename: './index.html', // 生成的html存放路径，相对于 path
        template: './src/assets/index.html',
        inject: true, // 允许插件修改哪些内容，包括head与body
        hash: false, // 为静态资源生成hash值
        // templateParameters: () => {
        // templateParameters: (compilation, assets, assetTags, options) => {
        //     return {
        //         compilation,
        //         webpackConfig: compilation.options,
        //         htmlWebpackPlugin: {
        //             tags: assetTags,
        //             files: assets,
        //             options,
        //         },
        //         prefetchHtml: ''
        //     };
        // },
        // N.B: 兼容模板里的变量
        // return { prefetchHtml: "" };
        // return { prefetchHtml: `<script type="text/javascript" charSet="utf-8" src="../../build/dll/dll.js"></script>` };
        // },
      }),
      new webpack.WatchIgnorePlugin({ paths: [/\.js$/, /\.d\.ts$/] }), // 忽略掉 d.ts 文件，避免因为编译生成 d.ts 文件导致又重新检查。
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env),
      }),
    ],

    resolve: {
      // modules: ['node_modules', path.join(__dirname, './node_modules')],
      // extensions: [ '.js', '.jsx', '.ts', '.tsx', '.scss', '.json' ],
      alias: {
        // '@root': path.resolve(APP_PATH),
        // '@components': path.resolve(APP_PATH, './components'),
        // '@assets': path.resolve(APP_PATH, './assets'),
        // '@main': path.resolve(APP_PATH, './main'),
      },
      plugins: [
        new TsconfigPathsPlugin({
          configFile: './tsconfig.json',
          logLevel: 'info',
          extensions: ['.ts', '.tsx'],
          // mainFields: ['main', 'browser']
          //   baseUrl: './',
        }),
      ],
    },
  });
};
