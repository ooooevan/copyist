
```bash
yarn global add lerna
lerna bootstrap
```

**module-name名字根据package.json的name字段确定**<br>

* 在`packages/module-a`添加dep-name模块，不加`--scope`的话所以package都会添加依赖
```bash
lerna add dep-name --scope module-a
```

* 在`package/module-b`添加`package/module-a`，会形成一个软连接
```bash
lerna add module-a --scope module-b
```

* 删除所有package的dep-name依赖，没有删除单个package中的依赖，需手动删除
```bash
lerna exec -- yarn remove dep-name
```

* 运行scripts命令
```bash
lerna run test --scope module-a
```