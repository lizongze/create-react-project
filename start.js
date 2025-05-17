const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const fs = require('fs');
const commandLineArgs = require('command-line-args');
// const execSync = require('child_process').execSync;

const optionDefinitions = [
  {
    name: 'webpackConfig',
    alias: 'w',
    type: String
  },
//   {
//     name: "deployEnv",
//     type: String,
//   }
];

const options = commandLineArgs(optionDefinitions);
let webpackConfigFilePath = 'webpack.serve.config.js';
// let deployEnv = "local";
// let deployEnv = "web2";

if (options && options.webpackConfig) {
  webpackConfigFilePath = options.webpackConfig;
}

// if(options && options.deployEnv){
//   deployEnv = options.deployEnv;
// }

// let HMR_MODE = 'hot';
// const argv = process.argv.slice(2);
// if (argv.includes('full')) {
//   HMR_MODE = 'full';
// } else if (argv.includes('none')){
//   HMR_MODE = 'none';
// }

const configPath = path.resolve(process.cwd(), webpackConfigFilePath);
if (fs.existsSync(configPath)) {
  const webpackDevServerPath = path.resolve(__dirname, './node_modules/webpack-dev-server/bin/webpack-dev-server.js');
  const execSync = require('./scripts/execSync');

  execSync(`node --max-old-space-size=4096 ${webpackDevServerPath} --history-api-fallback --config ${configPath}`);

  // execSync(`cross-env HMR=\"${HMR_MODE}\" node --max-old-space-size=4096 ${webpackDevServerPath} --history-api-fallback --config ${configPath} --env.DEPLOY_ENV=${deployEnv} --env.testEnv=testEnv`);
  // execSync(`export HMR=\"${HMR_MODE}\"; cross-env HMR=\"${HMR_MODE}\" node ${webpackDevServerPath} --history-api-fallback --config ${configPath} --env.DEPLOY_ENV=${deployEnv}`);
  // execSync(`node ${webpackDevServerPath} --config ${configPath} --open`);
}
