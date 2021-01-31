# tapable


## Usage

## 基类Hook、HookCodeFactory

Hook:用于注册taps，tap队列有优先级，使用插入排序

```js
const hook = new Hook();
hook.tap('a', () =>{
  console.log('..');
})
```

interceptor：register和tap可修改tap内容。

一次性调用call多次，得到的结果一样，即使interceptor.tap的fn。因为hook.call函数变了。只有再次注册tap或者注册interceptor才会reset call方法。所以执行前需要存储要执行的函数

要重置call函数，将call函数实体提出。新建Factory类，用于创建执行的code

分离基类Hook和SyncHook

开始实现SyncHook的promise和callAsync

实现SyncBailHook，在之前基础上判断tap执行结果，不是undefined则直接返回当前结果。最后callback(null, result)。没有用try..catch处理异常

实现SyncWaterfallHook，当没有taps时，返回的是传入的参数，但只会保留第一个参数。多个tap时，执行返回值没有就将入参传给下一个tap

SyncLoopHook:执行do while循环，tap返回值不是undefined则继续循环

AsyncParallelBailHook:返回值不是undefined，停止后续执行

AsyncSeriesHook:异步串行，不关心返回值

AsyncSeriesWaterfallHook: 异步串行，参数上下传递