import { exec } from 'child_process';

export default (
  repo: string,
  targetPath: string,
  opts: Record<string, string> | (() => void),
  cb?: (e?: any) => void,
) => {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  opts = opts || {};

  const cmds = [opts.git || 'git', 'clone'];

  if (opts.shallow) {
    cmds.push('--depth');
    cmds.push('1');
  }
  if (opts.checkout) {
    cmds.push('-b');
    cmds.push(opts.checkout);
  }
  if (opts.single) {
    cmds.push('--single-branch');
  }

  cmds.push('--');
  cmds.push(repo);
  cmds.push(targetPath);
  exec(cmds.join(' '), (err) => cb && cb(err));
};
