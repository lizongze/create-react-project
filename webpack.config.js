let path = require('path');
const os = require('os');
let resources = require('./scripts/webpack-resources');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const DropConsoleWebpackPlugin = require('drop-console-webpack-plugin');
// const { lodashConfig } = require('./import-config');
const createHash = require('webpack/lib/util/createHash');
const HashOutputWebpackPlugin = require('webpack-plugin-hash-output');
const TerserWebpackPlugin = require('terser-webpack-plugin');

var usedHashIds = new Set();

// const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require('webpack');

const version = require('./package.json').version;
const now = Date.now();

const ROOT_PATH = path.resolve(__dirname);
const APP_PATH = path.resolve(ROOT_PATH, 'src');

const DIST_ENV = process.env.DIST_ENV;
const dist = 'dist';
// const dist = DIST_ENV === "forTest" ? 'dist-test': 'dist';
const filename = './app.html';
// const filename = DIST_ENV === "forTest" ? './app-test.html': './app.html';

const svgDirs = [
  // path.resolve(__dirname, 'src/assets/svg-icons') // 自己私人的 svg 存放目录
];
let entryPointName = 'app';

// N.B: CDN
const { NODE_ENV_CDN } = process.env;
const { SOURCE_MAP } = process.env;
// let publicPath = DIST_ENV === "forTest" ? '/auth/public-test/' : '/auth/public/';
// if (NODE_ENV_CDN) {
// 	publicPath = NODE_ENV_CDN;
// }
// console.log('publicPath', publicPath, NODE_ENV_CDN);

let isProduction = true;

const babelPlugins =
  process.env.NODE_ENV === 'production'
    ? [
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-transform-named-capturing-groups-regex',
      ]
    : ['@babel/plugin-syntax-dynamic-import'];

const vendorCoreIncludeList = [
  /[\\/]react([\\/]|$)/,
  /[\\/]react-dom([\\/]|$)/,
  /[\\/]react-router([\\/]|$)/,
  /[\\/]react-router-dom([\\/]|$)/,
  /[\\/]history([\\/]|$)/,
  /[\\/]react-transition-group([\\/]|$)/,
  /[\\/]mobx([\\/]|$)/,
  /[\\/]mobx-react([\\/]|$)/,
  /[\\/]mobx-state-tree([\\/]|$)/,
  /[\\/]mobx-utils([\\/]|$)/,
  /[\\/]query-string([\\/]|$)/,
  /[\\/]autonumeric([\\/]|$)/,
  /[\\/]core-js\/library([\\/]|$)/,
  /[\\/]axios([\\/]|$)/,
  /[\\/]core-decorators([\\/]|$)/,
];

module.exports = function (argv) {
  let configs = [];
  const prodConfig = resources.createServeConfig(
    {
      entry: {
        app: ['./src/main/index'],
      },

      mode: 'production',
      output: {
        // publicPath: publicPath,
        filename: `[name].[contenthash:8].min.js`,
        path: path.resolve(ROOT_PATH, dist),
        // chunkFilename: `${entryPointName}-${version}-[name]-[chunkhash:8].min.js`,
        // N.B: 缓存优化 chunkhash contenthash 不配置该属性的话，HashOutputWebpackPlugin无法生效；其需要用到hashDigestLength属性
        hashDigestLength: 8,
      },

      externals: {},

      // externals: [
      //     {
      //         react: 'React'
      //     },
      //     {
      //         'react-dom': 'ReactDOM'
      //     }
      // ],

      module: {
        rules: [
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
          },
          // N.B: 给js文件也清除下注释
          {
            test: /\.js$/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  babelrc: false,
                  compact: false,
                  sourceMap: false,
                  comments: false,
                },
              },
            ],
            include: [/node_modules/, /\/packages\//],
          },
          {
            test: [/\.tsx?$/],
            use: [
              /**
               * babel-loader
               * 用来做按需加载
               * lodash => import
               * athen-gen => import-hook
               *
               * 蚂蚁的import支持将import _ from 'lodash'的全量引入写法转换成按需引用
               * @demo
               * 	import _ from 'lodash';
               * 	console.log(_.debounce) => console.log(require('lodash/debounce'))
               *
               * 不过，目前lodash无按需加载的效果，因为有的写了 import _ from 'lodash'，又没使用变量"_"，导致lodash依然被全量引入了
               *
               * TODO: 去掉全量引入lodash又没使用的代码 import _ from 'lodash'
               * TODO: echart 可以参考官方来做下按需加载
               *
               * 其实，有了prefetch by worker这个神器（\(^o^)/），上面的收益也不是很大，就是减小点流量
               */
              {
                loader: 'babel-loader',
                options: {
                  babelrc: false,
                  presets: ['@babel/preset-typescript'],
                  plugins: [
                    ...babelPlugins,
                    // Sadly react-hot-loader is not compatible with hooks, at least to my knowledge and their issue github page. https://github.com/gaearon/react-hot-loader/issues/1088
                    // "react-hot-loader/babel",
                    /**
                     * N.B: lodash _.chain().map().sort().value() 会挂，所以全量引入了
                     */
                    // [
                    // 	'import',
                    // 	{
                    // 		camel2DashComponentName: false,
                    // 		libraryName: 'lodash',
                    // 		libraryDirectory: '',
                    // 		customName: (name) => {
                    // 			// console.log('import plugin name', name);
                    // 			if (name === 'id') {
                    // 				name = 'identity';
                    // 			}
                    // 			return `lodash/${name}`;
                    // 		}
                    // 	}
                    // ],
                    // lodashConfig,
                    // 'extract-hoc/babel',
                    // 'react-hot-loader/babel'
                  ],
                  compact: false,
                  sourceMap: false,
                  comments: false,
                  // N.B: 注释留下webpack支持的模块方法，如webpackChunkName被去掉了的话，包名就变hash了
                  shouldPrintComment: (value = '') =>
                    /webpack[A-Z]/.test(value),
                    // N.B: 有时候需要保留license时，将commextractComments设为true即可
                    // || value.indexOf("@license") >= 0
                    // || value.indexOf("@preserve") >= 0
                  // cacheDirectory: true,
                },
              },
              {
                loader: 'ts-loader',
                options: {
                  happyPackMode: true,
                  experimentalWatchApi: true,
                  transpileOnly: true, // IMPORTANT! use transpileOnly mode to speed-up compilation
                },
              },
            ],
            exclude: [/node_modules/, /\.scss.ts$/, /\.test.tsx?$/],
          },
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
            use: ['url-loader?limit=8192&name=images/[contenthash:8].[name].[ext]'],
            exclude: svgDirs,
          },
          // {
          //     test: /\.(graphql|gql)$/,
          //     exclude: /node_modules/,
          //     use: [
          //         {
          //             loader: "graphql-tag/loader"
          //         }
          //     ]
          // }
        ],
      },

      plugins: [
        /**
         * HashOutputWebpackPlugin
         * N.B: 缓存优化：contentHash [chunkhash][contenthash] 用真实的基于内容的contenthash来替换webpack自带的contenthash（自带的在每次打包时，有几个chunk的contenthash会变化（尽管chunk里的内容没变））
         * issues => [Webpack 4 chunkhash/contenthash can vary between builds](https://github.com/webpack/webpack/issues/7179)
         * HashOutput必须放在首位
         * 必须设置 output.hashDigestLength 为[chunkhash:8]这里所保留的hash长度(8)
         */
        // new HashOutputWebpackPlugin(),
        new HtmlWebpackPlugin({
          filename, // 生成的html存放路径，相对于 path
          template: './src/assets/index.html',
          inject: true, // 允许插件修改哪些内容，包括head与body
          hash: false, // 为静态资源生成hash值,
          // N.B: 缓存优化 4.0.beta.x 文档描述未更新，参考了下源码
          minify: false,
          // templateParameters: () => {
          // 	// N.B: 兼容模板里的变量
          // 	return { prefetchHtml: "" };
          // },
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
        }),
        // new DropConsoleWebpackPlugin({
        // 	drop_log    : true,
        // 	drop_info   : true,
        // 	drop_warn   : true,
        // 	drop_error  : false,
        // 	exclude     : ['manifest'],    //排除不必要的chunk，减少build时间
        // }),
        // new MiniCssExtractPlugin({
        //     // Options similar to the same options in webpackOptions.output
        //     // both options are optional
        //     filename: "[name].css",
        //     chunkFilename: "[id].css"
        // }),
        // N.B: 缓存优化: chunkName [name] 用hashId来替换数字id索引（用数字id来当作manifest里的索引，可能会因为顺序变化而变化，导致缓存失效）
        // new webpack.NamedChunksPlugin((chunk) => {
        // 	if (chunk.name) {
        // 		return chunk.name;
        // 	}
        // 	const content = [...chunk._modules].map(item => item.id).join('');
        // 	return genHash(content);
        // }),
        // N.B: 缓存优化: moduleId 用hashId来替换数字id索引（用数字id来当作manifest里的索引，可能会因为顺序变化而变化，导致缓存失效）
        // This plugin will cause hashes to be based on the relative path of the module, generating a four character string as the module id. Suggested for use in production.
        new webpack.ids.HashedModuleIdsPlugin({}),
        new webpack.DefinePlugin({
          'process.env': JSON.stringify(process.env),
        }),
        ...getPlugins(entryPointName, isProduction),
      ],

      resolve: {
        plugins: [
          new TsconfigPathsPlugin({
            configFile: './tsconfig.json',
            logLevel: 'info',
            extensions: ['.ts', '.tsx'],
            mainFields: ['main', 'browser'],
          }),
        ],
      },

      optimization: {
        // usedExports: true,
        sideEffects: false,
        // moduleIds: 'named',
        // chunkFilename: "",
        removeEmptyChunks: false,
        removeAvailableModules: true,
        minimizer: [
          new TerserWebpackPlugin({
            exclude: [/^manifest\..*\.js/],
            parallel: os.cpus().length - 1 || true,
            extractComments: false,
            terserOptions: {
              sourceMap: !!SOURCE_MAP,
            },
          }),
        ],
        runtimeChunk: {
          name: 'manifest',
        },
        splitChunks: {
          chunks: 'async',
          minChunks: 1,
          /**
           * maxAsyncRequests
           * maxInitialRequests
           * N.B: 这两个条件对并行请求数做出了限制，这就意味着为了满足后两个条件，可能会产生体积较大的块。
           * (T_T) 栽在这两个属性上了，困了半天，最后发现是这个原因
           */
          maxAsyncRequests: 300,
          maxInitialRequests: 300, // The default limit is too small to showcase the effect
          // minSize: 1000, // This is example is too small to create commons chunks,
          minSize: 1,
          cacheGroups: {
            default: false,
            vendors: false,
            // packages: {
            // 	chunks: "async",
            // 	test: ({ context: name }) => {
            // 		name = name || '';
            // 		let ret = /[\\/](packages)|(@q7)([\\/]|$)/.test(name);
            // 		let excludeList = [];
            // 		if (ret) {
            // 			excludeList = [
            // 				/[\\/]athena-gen([\\/]|$)/,
            // 				// /[\\/]athena([\\/]|$)/,
            // 			]
            // 			if (excludeList.some(reg => reg.test(name))) {
            // 				ret = false;
            // 			}
            // 		}
            // 		// console.log('name, packages', ret, name, excludeList.find(reg => reg.test(name)))

            // 		return ret;
            // 	},
            // 	name: 'packages',
            // 	name({ context: name }) {
            // 		let ret = 'packages';
            // 		if (/[\\/]athena([\\/]|$)/.test(name)) {
            // 			// N.B: athena 和 athena/ag-grid 太大了，单拎出来
            // 			ret = 'athena';
            // 			if (/[\\/]ag-grid([\\/]|$)/.test(name)) {
            // 				ret = 'athena-grid'
            // 			}
            // 		}
            // 		return ret;
            // 	},
            // 	priority: 39,
            // },
            // vendorEcharts: {
            // 	chunks: "async",
            // 	test: /[\\/]node_modules[\\/](echarts|zrender)([\\/]|$)/,
            // 	name: 'vendorEcharts',
            // 	name(module, chunks, cacheGroupKey) {
            // 		const name = getEchartZrenderPkgName(module);
            // 		return `vendor-${name}`;
            // 	},
            // 	priority: 37,
            // },
            vendorInit: {
              chunks: 'initial',
              test: /node_modules/,
              name: 'vendorInit',
              // test: /node_modules/,
              priority: 35,
            },
            vendorCore: {
              chunks: 'async',
              test: ({ context: name }) => {
                name = name || '';
                let ret = false;
                if (/node_modules/.test(name)) {
                  const includeList = vendorCoreIncludeList;
                  if (includeList.some((reg) => reg.test(name))) {
                    ret = true;
                  }
                }

                return ret;
              },
              name: 'vendorCore',
              // test: /node_modules/,
              priority: 33,
            },
            vendor: {
              chunks: 'async',
              test: ({ context: name }) => {
                name = name || '';
                let ret = false;
                if (/node_modules/.test(name)) {
                  ret = true;
                  const excludeList = [
                    // N.B: 排除掉已经单拎出来的包
                    /[\\/]echarts([\\/]|$)/,
                    /[\\/]zrender([\\/]|$)/,
                    // /[\\/]athena([\\/]|$)/,
                    // /[\\/](packages)|(@q7)([\\/]|$)/,

                    // N/B: 不需要拎出来（放业务的包）
                    // /[\\/]athena-gen([\\/]|$)/, // N.B: 放业务里(按需加载后每个页面的很少)
                  ].concat(vendorCoreIncludeList);
                  if (excludeList.some((reg) => reg.test(name))) {
                    ret = false;
                  }
                }
                return ret;
              },
              name: 'vendor',
              // name({ context: name }) {
              // 	let ret = 'vendor';
              // 	// N.B: 需要单独拎出来的包
              // 	if (/[\\/]@blueprintjs\/(core|icons)[\\/]/.test(name)) {
              // 		ret = 'vendorBlueprint';
              // 	} else if (/[\\/]lodash([\\/]|$)/.test(name)) {
              // 		ret = 'vendorLodash';
              // 	}
              // 	return ret;
              // },
              // test: /node_modules/,
              priority: 30,
            },

            /**
             * N.B: bugfix 当业务代码里有强包含关系时，尽量别拆分包；容易触发找不到对应模块而引发页面崩溃的 bug
             * bug => which crashed page when build common chunks
             * 	1. Cannot read property 'call' of undefined => modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
             * 	2. TypeError: Cannot read property 'Options' of undefined
             * issues => [Uncaught TypeError: Cannot read property 'call' of undefined](https://github.com/webpack/webpack/issues/845)
             *
             * 	acostaf commented on 2 Jul 2016
             * 		Just for information, I founf that this error it is a bit misleading, it is not a bug but the way how you build your common chunks.
             *
             * N.B: 将commonSrcComponents的优先级调的比commonSrcSolutions高，不会报错，反之，会报错 TypeError: Cannot read property 'Options' of undefined
             *
             * FIXED: fixed 1、2 by removing config => reuseExistingChunk: true,  (deleted/false)
             * reuseExistingChunk => [what reuseExistingChunk: true means, can give a sample?](https://github.com/webpack/webpack.js.org/issues/2122)
             *
             * reuseExistingChunk 会导致当"预期分配在chunks的包"已经被分配时，
             * 		该模块的chunkName会被对应的ExistingChunk的name覆盖，
             * 		进而触发了当前webpack版本相关的bug，导致1、2等等，即打包好的代码跑起来报各种模块找不到的问题
             * 		所以将这个配置项都去掉了
             */
            // N.B: 人工指定的公共包
            // commonSrcMainComponents: {
            // 	chunks: "async",
            // 	test: /[\\/]src[\\/]main[\\/]components[\\/]/,
            // 	name: 'common-srcMainComponents',
            // 	priority: 29,
            // },
            // commonSrcComponents: {
            // 	chunks: "async",
            // 	test: /[\\/]src[\\/].*components[\\/]/,
            // 	name: 'common-srcComponents',
            // 	priority: 21,
            // },
            // commonSrcBizForm: {
            // 	chunks: "async",
            // 	test: /[\\/]src[\\/]solutions[\\/]biz-form[\\/]/,
            // 	name: 'common-srcBizForm',
            // 	priority: 19,
            // },
            // commonSrcSolutions: {
            // 	chunks: "async",
            // 	test: /[\\/]src[\\/]solutions[\\/]/,
            // 	name: 'common-srcSolutions',
            // 	priority: 11,
            // },
            commons: {
              chunks: 'async',
              test: ({ context: name }) => {
                name = name || '';
                let ret = true;
                if (/[\\/](echarts|zrender)([\\/]|$)/.test(name)) {
                  ret = false;
                }
                return ret;
              },
              name: 'commons',
              minChunks: 6,
              priority: 1,
              minSize: 300000, // This is example is too small to create commons chunks,
            },
          },
        },
      },
    },
    isProduction,
  );

  configs.push(prodConfig);

  return configs;
};

function getPlugins(bundleName, isProduction) {
  // const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

  const plugins = [];

  // if (isProduction) {
  //     plugins.push(
  //         new BundleAnalyzerPlugin({
  // 			// analyzerPort: 8868,
  //             analyzerMode: 'static',
  //             reportFilename: bundleName + '.stats.html',
  //             openAnalyzer: false,
  //             generateStatsFile: true,
  //             statsOptions: {
  //                 source: false,
  //                 reasons: false,
  //                 chunks: false,
  //             },
  //             statsFilename: bundleName + '.stats.json',
  //             logLevel: 'warn'
  //         })
  //     );
  // }

  return plugins;
}

function genHash(content, options) {
  options = options || {
    hashFunction: 'sha256',
    hashDigest: 'hex',
    hashDigestLength: 6,
  };
  const hash = createHash(options.hashFunction);
  hash.update(content);
  const hashId = hash.digest(options.hashDigest);
  let len = options.hashDigestLength;
  while (usedHashIds.has(hashId.substr(0, len))) len++;
  const ret = hashId.substr(0, len);
  usedHashIds.add(ret);
  return ret;
}

function getEchartZrenderPkgName(module) {
  const path = module.identifier();
  const nameMatchRes = path.match(/[\\/]node_modules[\\/](echarts|zrender)([\\/]|$)/) || [];
  return nameMatchRes[1];
}
