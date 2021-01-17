# @copyist/eslint-plugin

一个简单eslint插件，需要添加相关依赖

```bash
yarn add eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-config-airbnb-base -D # js # prettier@2.0.0?
yarn add eslint-config-airbnb eslint-plugin-react -D  # react
yarn add @typescript-eslint/eslint-plugin -D  # ts
```

```bash
yarn add @copyist/eslint-plugin -D
```


.vscode/settings.json
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
}
```

.eslintrc.json
```json
{
  "extends": ["plugin:@copyist/react-ts"],
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": ["@copyist"]
}
```

配合husky
```bash
yarn add husky lint-staged
```
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "src/**/*.{ts,tsx,js,jsx}": [
      "eslint --fix"
    ]
  }
}
```




参考[linxiaowu66/eslint-config-templates](https://github.com/linxiaowu66/eslint-config-templates)、[eslint-config-ali](https://github.com/alibaba/f2e-spec/tree/main/packages/eslint-config-ali)等