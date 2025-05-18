let path = require('path');
const os = require('os');
let resources = require('./scripts/webpack-resources');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const postcssPresetEnv = require('postcss-preset-env');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
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

    // N.B: 开启 持久化缓存 cache snapshot 相关配置
    // 参考：深度解析webpack5持久化缓存[https://segmentfault.com/a/1190000041726881]
    cache: {
      // 开启持久化缓存
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    },
    snapshot: {
      // 针对包管理器维护存放的路径，如果相关依赖命中了这些路径，那么他们在创建 snapshot 的过程当中不会将 timestamps、content hash 作为 snapshot 的创建方法，而是 package 的 name + version
      // 一般为了性能方面的考虑，
      managedPaths: [path.resolve(__dirname, '../node_modules')],
      immutablePaths: [],
      // 对于 buildDependencies snapshot 的创建方式
      buildDependencies: {
        // hash: true
        timestamp: true,
      },
      // 针对 module build 创建 snapshot 的方式
      module: {
        // hash: true
        timestamp: true,
      },
      // 在 resolve request 的时候创建 snapshot 的方式
      resolve: {
        // hash: true
        timestamp: true,
      },
      // 在 resolve buildDependencies 的时候创建 snapshot 的方式
      resolveBuildDependencies: {
        // hash: true
        timestamp: true,
      },
    },
    // optimization: {
    //     moduleIds: 'deterministic', // 根据文件路径生成确定性ID
    //     chunkIds: 'deterministic',  // 避免开发时chunkID变化
    //     runtimeChunk: 'runtime',     // 分离runtime代码防止频繁变更
    // },

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
        {
          test: [/\.tsx?$/],
          use: [
            // N.B: 持久化缓存，类似webpack5文件缓存
            'cache-loader',
            {
              loader: 'thread-loader',
              options: {
                // there should be 1 cpu for the fork-ts-checker-webpack-plugin
                workers: os.cpus().length,
              },
            },
            {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                cacheDirectory: true,
                presets: ['@babel/preset-typescript'],
                plugins: [
                  // '@babel/plugin-syntax-dynamic-import',
                  'react-refresh/babel',
                ],
              },
            },
            {
              loader: 'ts-loader',
              options: {
                // N.B: must enable happyPackMode for thread-loader
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
      // N.B: enables fast refresh
      new ReactRefreshWebpackPlugin(),
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
      //   extensions: [ '.js', '.jsx', '.ts', '.tsx', '.scss', '.json' ],
      alias: {
        // 'react-dom': '@hot-loader/react-dom',
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
