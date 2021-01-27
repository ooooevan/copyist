/* eslint-disable no-new-func */
/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable import/no-cycle */
import { Hook } from './Hook';
import { CompileOptions } from './interfaces/Hook';

export class HookCodeFactory {
  config: any;

  constructor(config?: any) {
    // this.config = config;
  }

  /** 创建执行函数 */
  create(options: CompileOptions) {
    // console.log(options);
    let code = `
    var _taps = this.taps;
    var _ics = this.interceptors;
    `;
    let icsIdx = 0;
    options.interceptors.forEach((ics) => {
      if (ics.call) {
        code += `_ics[${icsIdx}].call(${options.args.join(',')});`;
        icsIdx++;
      }
    });
    const _tapCbs = options.interceptors.map((_i) => _i.tap).filter(Boolean);
    const fn = new Function(
      options.args.join(','),
      (code += `
      const _tapCbs = _ics.map(_tap=>_tap.tap).filter(Boolean);
      _taps.forEach((tap, tIdx) => {
        if (tap.fn) {
          ${_tapCbs.map((_t, idx) => `_tapCbs[${idx}](tap)`).join(';')}
          this._x[tIdx](${options.args.join(',')});
        }
      });
    `),
    ) as (...args: any[]) => void;
    return fn;
  }

  /** 存储fns */
  setup(instance: Hook, options: CompileOptions) {
    instance._x = options.taps.map((t) => t.fn) as ((...args: any[]) => void)[];
  }
}
