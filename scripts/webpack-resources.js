const webpack = require('webpack');
const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const webpackVersion = require('webpack/package.json').version;
const isProd = process.env.NODE_ENV === 'production';
// const extractCSS = isProd || process.env.TARGET === 'development';
const extractCSS = isProd;
const merge = require('./merge');
const os = require('os');
const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({ size: (os.cpus().length - 1) || 1 });
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

console.log(`Webpack version: ${webpackVersion}`);

const HMR_MODE_HOT = process.env.HMR === 'hot' ? true : false;
const DIST_ENV = process.env.DIST_ENV
const dist = "dist";
// const dist = DIST_ENV === "forTest" ? 'dist-test': 'dist';
// const CODE_MINIFY = dist === "dist"

const argv = process.argv.slice(2);
const needSourceMap = process.env.SOURCE_MAP;

module.exports = {
  webpack,

  createConfig(packageName, isProduction, customConfig, onlyProduction) {
    const resolveLoader = {
      modules: [
        path.resolve(__dirname, '../node_modules'),
        path.resolve(process.cwd(), 'node_modules')
      ]
    };

    const module = {
      // noParse: [/autoit.js/],
      rules: [
        {
          test: /\.js$/,
          use: 'source-map-loader',
          enforce: 'pre'
        }
      ]
    };

    const devtool = 'cheap-module-source-map';
    const configs = [];

    if (!onlyProduction) {
      configs.push(
        merge(
          {
            mode: 'development',
            output: {
              filename: `[name].js`,
              path: path.resolve(process.cwd(), dist),
              pathinfo: false
            },
            resolveLoader,
            module,
            devtool,
            // plugins: getPlugins(packageName, false)
          },
          customConfig
        )
      );
    }

    if (isProduction) {
      configs.push(
        merge(
          {
            mode: 'production',
            output: {
              filename: `[name].[contenthash:8].min.js`,
              path: path.resolve(process.cwd(), dist)
            },

            resolveLoader,
            module,
            devtool,
            // plugins: getPlugins(packageName, true)
          },
          customConfig
        )
      );
    }

    return configs;
  },

  createServeConfig(customConfig, isProduction) {
    const WebpackNotifierPlugin = require('webpack-notifier');
    const { SENTRY_RELEASE_NAME = '',SENTRY_PROJECT_DSN='',SENTRY_PROJECT_URL_PREFIX='' } = process.env

    const ret = merge(
      {
        devServer: {
          // inline: true,
          port: 4322
        },

        mode: 'development',

        output: {
          filename: `[name].js`,
          path: path.resolve(process.cwd(), dist),
          pathinfo: false
        },

        resolveLoader: {
          modules: [
            path.resolve(__dirname, '../node_modules'),
            path.resolve(process.cwd(), 'node_modules')
          ]
        },
        resolve: {
          extensions: ['.ts', '.tsx', '.js']
        },

        // devtool: 'eval',

        module: {
          rules: [
            {
              test: /\.scss$/,
              enforce: 'pre',
              exclude: [
                /node_modules/,
                /src(\/|\\)assets/,
              ],
              use: [
                'style-loader',
                // {
                //   loader: '@microsoft/loader-load-themed-styles' // creates style nodes from JS strings
                // },
                {
                  loader: 'css-loader', // translates CSS into CommonJS
                  options: {
                    modules: true,
                    importLoaders: 2,
                    localIdentName: isProduction ? undefined : '[name]_[local]_[hash:base64:5]',
                    minimize: false,
                  }
                },
                {
                  loader: 'postcss-loader',
                  options: {
                    plugins: function() {
                      return [require('autoprefixer')];
                    }
                  }
                },
                {
                  loader: 'sass-loader'
                }
              ]
            },
            {
              test: /\.scss$/,
              // css-hot-loader会增加打包的体积
              include: [
                /src(\/|\\)assets/,
              ],
              loader: 'happypack/loader',
              options: {
                id: "scss"
              },
              //use: [ 'style-loader', 'css-loader', 'sass-loader' ]

              // use:
              // 	env === 'production'
              // 		? [ MiniCssExtractPlugin.loader, 'css-loader?importLoaders=1' ]
              // 		: [ 'css-hot-loader', MiniCssExtractPlugin.loader, 'css-loader?importLoaders=1' ]
              // /*  use: ExtractTextPlugin.extract({
              //   fallback: 'style-loader',
              //   use: ['css-hot-loader', 'css-loader', 'postcss-loader', 'sass-loader']
              // }) */
            },
            /**
             *  N.B: production 模式下用link/webpack.config.js的ts编译配置了；
             * 同样的配置（用了babel按需加载插件），这个happypack多线程编译时，会导致babel插件报错
             */
            // !isProduction && {
            //   test: [/\.tsx?$/],
            //   loader: 'happypack/loader',
            //   options: {
            //     id: "tsx"
            //   },
            //   // exclude: [/node_modules/, /\.scss.ts$/, /\.test.tsx?$/,  /\.js$/],
            //   exclude: [/node_modules/, /\.scss.ts$/, /\.test.tsx?$/]
            // },

            // {
            //   test: [/\.tsx?$/],
            //   use: [
            //     /**
            //      * babel-loader
            //      * 用来做按需加载
            //      * lodash => import
            //      * athen-gen => import-hook
            //      *
            //      * 蚂蚁的import支持将import _ from 'lodash'的全量引入写法转换成按需引用
            //      * @demo
            //      * 	import _ from 'lodash';
            //      * 	console.log(_.debounce) => console.log(require('lodash/debounce'))
            //      *
            //      * 不过，目前lodash无按需加载的效果，因为有的写了 import _ from 'lodash'，又没使用变量"_"，导致lodash依然被全量引入了
            //      *
            //      * TODO: 去掉全量引入lodash又没使用的代码 import _ from 'lodash'
            //      * TODO: echart 可以参考官方来做下按需加载
            //      *
            //      * 其实，有了prefetch by worker这个神器（\(^o^)/），上面的收益也不是很大，就是减小点流量
            //      */
            //     {
            //       loader: 'babel-loader',
            //       options: {
            //         babelrc: false,
            //         presets: ['@babel/preset-typescript'],
            //         plugins: [
            //           ...babelPlugins,
            //           // Sadly react-hot-loader is not compatible with hooks, at least to my knowledge and their issue github page. https://github.com/gaearon/react-hot-loader/issues/1088
            //           // "react-hot-loader/babel",
            //           /**
            //            * N.B: lodash _.chain().map().sort().value() 会挂，所以全量引入了
            //            */
            //           // [
            //           // 	'import',
            //           // 	{
            //           // 		camel2DashComponentName: false,
            //           // 		libraryName: 'lodash',
            //           // 		libraryDirectory: '',
            //           // 		customName: (name) => {
            //           // 			// console.log('import plugin name', name);
            //           // 			if (name === 'id') {
            //           // 				name = 'identity';
            //           // 			}
            //           // 			return `lodash/${name}`;
            //           // 		}
            //           // 	}
            //           // ],
            //           // lodashConfig,
            //           // 'extract-hoc/babel',
            //           // 'react-hot-loader/babel'
            //         ],
            //         compact: false,
            //         sourceMap: false,
            //         comments: false,
            //         // N.B: 注释留下webpack支持的模块方法，如webpackChunkName被去掉了的话，包名就变hash了
            //         shouldPrintComment: (value = '') =>
            //           /webpack[A-Z]/.test(value),
            //           // N.B: 有时候需要保留license时，将commextractComments设为true即可
            //           // || value.indexOf("@license") >= 0
            //           // || value.indexOf("@preserve") >= 0
            //         // cacheDirectory: true,
            //       },
            //     },
            //     {
            //       loader: 'ts-loader',
            //       options: {
            //         happyPackMode: true,
            //         experimentalWatchApi: true,
            //         transpileOnly: true, // IMPORTANT! use transpileOnly mode to speed-up compilation
            //       },
            //     },
            //   ],
            //   exclude: [/node_modules/, /\.scss.ts$/, /\.test.tsx?$/],
            // },

          ].filter(v => v)
        },

        plugins: [
          // new webpack.DefinePlugin({
          // '__NEED_SOURCE_MAP__': `"${needSourceMap}"`,
          // // '__SENTRY_RELEASE_NAME__': `"${SENTRY_RELEASE_NAME}"`,
          // // '__SENTRY_PROJECT_DSN__': `"${SENTRY_PROJECT_DSN}"`,
          // }),
          // SENTRY_RELEASE_NAME && SENTRY_PROJECT_URL_PREFIX && new SentryPlugin({
          //   include: './dist',
          //   release: SENTRY_RELEASE_NAME,
          //   urlPrefix:SENTRY_PROJECT_URL_PREFIX,
          //   sourceMapReference: true,
          // }),
          !isProduction && new WebpackNotifierPlugin(),
          // new ForkTsCheckerWebpackPlugin(),
          // new FriendlyErrorsWebpackPlugin({
          //   clearConsole: true
          // }),
          new CaseSensitivePathsPlugin(),
          new HappyPack({
            id: 'scss',
            threadPool: happyThreadPool,
            loaders: ['style-loader', 'css-loader', 'sass-loader']
          }),
          /*
          !isProduction && new HappyPack({
            id: 'tsx',
            threadPool: happyThreadPool,
            loaders: [
              //  { loader: 'cache-loader' },
              //{
              //	loader: 'thread-loader',
              //	options: {
              //		// there should be 1 cpu for the fork-ts-checker-webpack-plugin
              //		workers: os.cpus().length,
              //	},
              //},
              !isProduction && { loader: 'react-hot-loader/webpack' },
              // !isProduction && HMR_MODE_HOT && { loader: 'react-hot-loader/webpack' },
              {
                loader: 'ts-loader',
                options: {
                  happyPackMode: true,
                  experimentalWatchApi: true,
                  transpileOnly: true
                }
              },

            ].filter(v => v)
          })
          */
        ].filter(v => v)
      },
      customConfig
    );

    /**
     * N.B: sourcemap 开启和关闭
     * 背景：开发提测环境需要source-map，以方便调试。（souce-map开启后无法去除注释）
     * 线上环境需要关闭sourcemap以获得更好的压缩效果（会去除注释，减小更多的体积）。(等迭代或者产品稳定了，bug少了再去掉source-map)
     *
     * 设想1：用source-map模式，将.map文件独立出来，在线上的时候不上传.map文件，以保证测试环境和线上环境的代码是一致的。
     * 后果：额，source-map模式只要上到外网，其它人可访问，就会导致源码泄漏(可通过manifest拿到所有的js文件，进而得到.map文件，就拿到源码了)
     *
     * 设想2：用eval模式
     * 后果：代码体积大些，外网用户可看到被编译成es5的源码（应该是可以接受的）
     *
     * 所以只有内网环境才可以上source-map模式，外网环境要source-map的话，就只能用eval模式了（就是体积大些，等稳定了可以去掉eval）（不会泄漏源码，代码为es5的source-map）
     *
     * 结论： 只能选择用与不用eval模式。
     */
    let config = ret;
    if (needSourceMap) {
      config = Object.assign(
        {
          // devtool: 'eval',
          devtool: 'source-map',
          // 自动化测试使用eval模式
          // devtool: CODE_MINIFY ? 'source-map' : 'eval',
        },
        ret
      );
    }

    /**
     * N.B: eval also belongs to cheap-source-map, 导致无法去掉注释
     * issues => [Removing comments does not work when setting devtool to eval](https://github.com/webpack-contrib/uglifyjs-webpack-plugin/issues/180)
     */
    config = merge(
      isProduction ? {} : {
        devtool: 'source-map',
      },
      config
    );
    console.log('config', config);
    return config;
  }
};

// function getPlugins(bundleName, isProduction) {
//   const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
//   const plugins = [];

//   if (isProduction) {
//     plugins.push(
//       new BundleAnalyzerPlugin({
//         analyzerMode: 'static',
//         reportFilename: bundleName + '.stats.html',
//         openAnalyzer: false,
//         generateStatsFile: true,
//         statsOptions: {
//           source: false,
//           reasons: false,
//           chunks: false
//         },
//         statsFilename: bundleName + '.stats.json',
//         logLevel: 'warn'
//       })
//     );
//   }

//   return plugins;
// }
