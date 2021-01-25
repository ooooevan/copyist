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
interceptor：register可修改tap

