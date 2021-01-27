import { Hook } from './Hook';
import { HookCodeFactory } from './HookCodeFactory';
import { CompileOptions } from './interfaces/Hook';

const factory = new HookCodeFactory();

export class SyncHook extends Hook {
  compile(options: CompileOptions) {
    factory.setup(this, options);
    return factory.create(options);
  }

  tapAsync = () => {
    throw new Error('SyncHook 不支持 tapAsync');
  };

  tapPromise = () => {
    throw new Error('SyncHook 不支持 tapPromise');
  };
}
