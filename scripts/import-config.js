// const plugin = require('babel-plugin-import-hook');

/**
 * lodashConfig
 * N.B: 将按需引入换成全量引入（由于不支持_.chain().map().sort()的原因）,否则既有全量包，又有按需包
 */
module.exports.lodashConfig = [
	'import-hook',
	{
		libraryName: /^lodash([/]|$)/,
		customName(option) {
			const { value } = option;
			let ret = value;
			if (!value.includes('/fp/')) {
				const matchResList = value.match(/^lodash[/](.*)/) || [];
				const funcName = matchResList[1];
				if (funcName) {
					ret = Object.assign({}, option, {
						importedName: funcName,
						localName: funcName,
						value: 'lodash',
						isDefaultImport: false,
					})
				}
			}

			return ret;
		}
	},
	'lodash'
];
