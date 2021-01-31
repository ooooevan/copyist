/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { AsyncSeriesWaterfallHook } from '../src';

describe('AsyncSeriesWaterfallHook', () => {
  it('', async () => {
    const hook = new AsyncSeriesWaterfallHook(['x']);
    hook.tapAsync('a', (x, cb) => {
      expect(x).toBe(1);
      cb(2);
    });
    hook.tap('a', (x) => {
      expect(x).toBe(2);
    });
    await new Promise((resolve) => {
      hook.callAsync(1, () => {
        resolve(1);
      });
    });
  });
});
