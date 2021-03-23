## download-git-repo

搬自[download-git-repo](https://gitlab.com/flippidippi/download-git-repo)并做一些优化

安装
```bash
yarn add @copyist/download-git-repo
```

## download-git-repo分析

#### 用于方便下载git仓库，写法有下：
* 默认解析为github：flippidippi/download-git-repo-fixture
* 指定仓库：bitbucket:flippidippi/download-git-repo-fixture#my-branch
* 指定域名：mygitlab.com:flippidippi/download-git-repo-fixture
* 指定直接地址：direct:https://gitlab.com/flippidippi/download-git-repo-fixture/repository/archive.zip

#### 下载方式：
* 克隆仓库（clone: true）使用git clone下载仓库
* 不可隆，会拼接成仓库的zip包，文件更小


#### 流程：
1. 判断是否direct，是则直接git-clone或下载压缩包
2. 用正则匹配出url得到type、origin、owner、name、checkout。type支持github|gitlab|bitbucket
3. 三种type，能拼接出最终下载地址
4. 是clone则用git-clone拉取，否则用download模块下载压缩包解压

#### 问题：
* git-clone拉取错误时只有一个错误码没有错误信息，很不友好
* 当传入一个http地址时，仍进行猜测并拼接出一个错误地址
* 使用clone模式，都使用ssh链接而不是https，没有前配置公钥就会报错

### 修改：
1. 改了git-clone，错误时显示错误信息
2. 传入http地址或`/.git$/`地址，当做direct模式处理
3. type:owner/repo模式，拼接成https链接，避免权限问题
4. 使用ts并优化了点代码，测试用例中`github`域名有网络问题，其他较稳定



## 参考
[git clone几种可选参数的使用与区别](https://blog.csdn.net/shrimpcolo/article/details/80164741)


