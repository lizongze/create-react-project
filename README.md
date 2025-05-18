## lint-staged 拆分“有效变更”和“美化变更”
* 背景：有时候为了查bug需要追溯变更时，只想去查有效变更，可是有时候会遇上一大篇格式化操作，* 极大的混淆了视听，降低了效率；
* 思路：prettier美化代码后，不执行git add，先提交有效变更，后面再提交无效变更
* 方案：去除lint-staged配置里的git add,新增个npm快捷命令辅助提交
* 影响：导致格式化的代码没有自动提交，需要手动提交或手动执行npm run post-fmt
* bug：遇到删除文件的case时，git add 已删文件会报错，这时只能手动add,commit相关文件了

### 在tsconfig.json里配置paths alias就行，不用在webpack里配

### react.lazy 导入deault组件时，有大概率报错
请用:
export { App as default } from "./App"
