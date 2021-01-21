# cra

一个简单的cra，模仿[create-react-app](https://github.com/facebook/create-react-app)

create-react-app模块初始化需要先下载依赖，然后调用react-scripts的init方法初始化模板。这里合并在一起。<br>
做了简化处理，展示其流程


## Usage

```bash
yarn global add @copyist/create-react-app
cra my-app
```

### 简单流程
1. 判断node版本，小于10直接退出
2. 确认\<app-name\>，没有则退出
3. 检查本地create-react-app版本是否最新
4. 目标目录新建package.json文件
5. 下载react、react-dom、react-scripts、template
6. 从template中的template.json合并到package.json
7. 将template复制到目标目录
8. git init
9. 下载依赖
10. git commit


参考
[create react app 核心思路分析](https://zhuanlan.zhihu.com/p/339939088)

