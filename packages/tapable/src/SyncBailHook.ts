/* eslint-disable max-classes-per-file */
import { Hook } from './Hook';
import { HookCodeFactory } from './HookCodeFactory';
import { CompileOptions, TapType } from './interfaces/Hook';

class SyncBailHookCodeFactory extends HookCodeFactory {
  callbackResult(type?: TapType) {
    if (type === TapType.sync) {
      return '';
    }
    return 'callback(null, result)';
  }

  tapResult(type?: TapType) {
    return `if (result !== undefined){
      ${(type === TapType.promise && 'resolve(result);') || ''}
      ${(type === TapType.async && 'callback(null, result);') || ''}
      return result;
    }`;
  }
}
const factory = new SyncBailHookCodeFactory();

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
