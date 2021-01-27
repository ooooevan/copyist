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