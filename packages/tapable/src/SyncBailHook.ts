import { Hook } from './Hook';
import { HookCodeFactory } from './HookCodeFactory';
import { CompileOptions } from './interfaces/Hook';

const factory = new HookCodeFactory();

/** 同步串行，函数不返回undefined，跳过剩下函数 */
export class SyncBailHook extends Hook {
  compile(options: CompileOptions) {
    factory.setup(this, options);
    return factory.create(options);
  }

  tapAsync = () => {
    throw new Error('SyncBailHook 不支持 tapAsync');
  };

  tapPromise = () => {
    throw new Error('SyncBailHook 不支持 tapPromise');
  };
}
