# tapable

类似EventListener，用于发布订阅事件，模仿[tapable](https://github.com/webpack/tapable)

## Usage

```js
const hook = new SyncHook(['arg1']);
hook.tap('tap1', (arg1) =>{
  console.log('tap执行：', arg1);
})
hook.call('1');
// 输出：tap执行： 1
```

## 基类Hook、HookCodeFactory

Hook:用于注册taps，tap队列有优先级，使用插入排序

interceptor：register和tap可修改tap内容。

一次性调用call多次，得到的结果一样，即使interceptor.tap的fn。因为hook.call函数变了。只有再次注册tap或者注册interceptor才会reset call方法。所以执行前需要存储要执行的函数

要重置call函数，将call函数实体提出。新建Factory类，用于创建执行的code

|方法|执行方式|备注|
|-|-|-|
|SyncHook|同步串行|
|SyncBailHook|同步串行|返回值不是undefined，跳过后续tap执行并返回|
|SyncWaterfallHook|同步串行|上一个tap返回值传给下一个tap|
|SyncLoopHook|同步循环|返回值不是undefined，继续循环|

|ASyncParallelHook|异步并发|
|ASyncParallelBailHook|异步并发|返回值不是undefined，跳过后续tap执行并返回|
|ASyncSeriesHook|异步串行|
|ASyncSeriesBailHook|异步串行|返回值不是undefined，跳过后续tap执行并返回|
|ASyncSeriesWaterfallHook|异步串行|上一个tap返回值传给下一个tap|

少了一些异常处理