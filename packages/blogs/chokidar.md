# chokidar

文件监听模块，解决node的`fs.watch`和`fs.watchFile`兼容性和功能性不足

## Usage


## node原生方法

两个方法的状态都是`unstable`


|方法|实现|备注|
|-|-|-|
|watchFile|轮询|耗内存|
|watch|底层事件钩子|不同平台不兼容，Mac触发事件异常|


1. linux使用inotify，mac用FSEvents，windows用ReadDirectoryChangesW
2. 监听文件夹时用watch比监听多个watchFile效率高
3. 一次写操作可能触发多次写事件，因为底层可能触发多次修改

优先用watch，再用watchFile

## 一些优化方法
1. 对比文件修改时间

* 增加修改时间对比，减少无意义触发

2. 校验文件md5

* 每次计算文件内容md5，但文件存储可能存在中间状态还是会触发多个

3. 加入延迟机制

* 加入延迟触发，当短时间内触发多次，可认为是一次修改

## chokidar
|事件类型|备注|
|-|-|
|all|所有事件|
|add|添加文件|
|unlink|删除文件|
|unlinkDir|删除文件夹|
|change|修改文件|
|addDir|添加文件夹|

目录结构
```bash
-index
  ├─nodefs-handler
  └─fsevents-handler
```
解释：默认使用`nodefs-handler`（基于`fs.watch`和`fs.watchFile`），如果是OSX系统，使用自定义的`fsevents-handler`（基于`fsevents`）

FSWatcher.add
```js
if nodefs-handler
  path.forEach:_fsEventsHandler._addToFsEvents
else
  path.forEach:_nodeFsHandler._addToNodeFs
```

* _nodeFsHandler._addToNodeFs
```js
if stats.isDirectory()
  _handleDir
else if stats.isSymbolicLink()
  _handleDir
else
  _handleFile
```

_handleDir/_handleFile
```js
_watchWithNodesFs
  if usePoll
    setFsWatchFileListener
    fs.watchFile
  else
    setFsWatchListener
    fs.watch
```

* _fsEventsHandler._addToFsEvents

```js
initWatch
  _watchWithFsEvents
    setFSEventsListener
      createFSEventsInstance
        fsevents.watch
```

fsevents:
nodejs扩展摸模块，调用macos底层api及相关文件监控事件，避免原生fs模块自带监控问题

### 参考
[精读《如何利用 Nodejs 监听文件夹》](https://juejin.cn/post/6844903617300791310)

[源码解读系列之 chokidar](https://juejin.cn/post/6844903956359938061)
