## lint-staged 拆分“有效变更”和“美化变更”
* 背景：有时候为了查bug需要追溯变更时，只想去查有效变更，可是有时候会遇上一大篇格式化操作，极大的混淆了视听，降低了效率；
* 思路：prettier美化代码后，不执行git add，先提交有效变更，后面再提交无效变更
* 方案：去除lint-staged配置里的git add,新增个npm快捷命令辅助提交
* 影响：导致格式化的代码没有自动提交，需要手动提交或手动执行npm run post-fmt
* bug：遇到删除文件的case时，git add 已删文件会报错，这时只能手动add,commit相关文件了
* css：css影响不大，不用区分是否格式化，直接git add就行

### 在tsconfig.json里配置paths alias就行，不用在webpack里配

### [高阻塞/已解决]react.lazy 导入deault组件时，有大概率报错
请用:
export { App as default } from "./App"

### sass-loader/css moudles isslues:
error:[高阻塞/已解决]
* TypeError: Cannot read properties of undefined (reading 'flexRight')
```ts
// wrong:
import styles from './ChatListItem.scss';

// fixed by:
import * as styles from './ChatListItem.scss';
```

error:[高阻塞/已解决]
* SassError: expected "{". injectStylesIntoStyleTag

#### fixed by:
* change node-sass into sass, remove node-sass
* 移除重复的scss和css resolve rules，有时单个loader弄成多次了(有好几个文件，搞晕了)

### mobx响应失效自查：
* 异步操作observable数据时，要用ation包裹“同步函数”

## mobx装饰器没生效，无法监听数据改动而响应
```typescript
// wrong:
class Store {
    @observable
    public list = [];
}

// fixby:
class Store {
    @observable
    public accessor list = [];

    @custom_decorator
    @observable
    public accessor lazyList = [];
}

```

### useEffect在每次重新渲染后都运行？不能省略依赖数组
```typescript
// wrong
useEffect(() => {
  // ...
}); // 🚩 没有依赖项数组：每次重新渲染后重新运行！

// fixby:
useEffect(() => {
}, [])
```
