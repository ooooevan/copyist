/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable guard-for-in */
import { sync as rm } from 'rimraf';
import downloadUrl = require('download');
import { zipMapper, originMapper } from './mapper';
import gitclone from './git-clone';
import { Mapper, RepoInfo } from './interfaces';

function checkProtocol(origin: string) {
  if (!/^(f|ht)tps?:\/\//i.test(origin)) {
    origin = `https://${origin}`;
  }
  return origin;
}
function interpolation(desc: string, data: RepoInfo) {
  for (const key in data) {
    const d = `{${key}}`;
    desc = desc.replace(d, data[key]);
  }
  return desc;
}
function buildUrl(repo: RepoInfo, clone?: boolean) {
  let url;
  const { owner = '', name = '', origin = '', type = 'github' } = repo;

  const origins = `${checkProtocol(origin)}/`;
  repo.origin = origins;
  if (clone) {
    url = `${origins}${owner}/${name}.git`;
  } else {
    const urlDesc = zipMapper[type];
    if (!urlDesc) {
      throw new Error(`not support ${type} repo`);
    }
    url = interpolation(urlDesc, repo);
  }

  return url;
}
function normalize(repo: string, clone?: boolean): RepoInfo {
  const directRegex = /^(?:(direct):([^#]+)(?:#(.+))?)$/;
  const gitRegex = /\.git$/;
  const urlRegex = /^((?:f|ht)tps?:\/\/([^/]+))\/([^/]+)\/([^#]+)(?:#(.+))?/;
  // 是不是direct
  const directMatch = directRegex.exec(repo);
  // 是不是git仓库地址
  const gitMatch = gitRegex.exec(repo);
  // 是不是url地址
  const urlMatch = urlRegex.exec(repo);
  if (directMatch) {
    return {
      url: directMatch[2],
      checkout: directMatch[3],
    };
  }
  if (gitMatch || urlMatch) {
    return {
      url: repo,
    };
  }
  // type:origin:owner/name#checkout
  let obj: RepoInfo = {};

  const originReg = /(?:f|ht)tps?:([^:]+)/;
  const originMatch = originReg.exec(repo);
  if (originMatch) {
    repo = repo.replace(`${originMatch[0]}:`, '');
    const [origin] = originMatch;
    obj.origin = origin;
  }

  const regex = /(([^:.]+):)?(([^:]+):)?([^:#]+)(#(.+))?/;

  const match = regex.exec(repo) || [];
  const type = match[2] || 'github';
  const origin = match[4] || originMapper[type];
  const owner = match[5].split('/')[0];
  const name = match[5].split('/').slice(1).join('/');
  const checkout = match[7] || 'master';

  if (!type && origin) {
    for (const _type in originMapper) {
      const _origin = originMapper[_type].replace(/(?:f|ht)tps?:\/\//, '');
      if (_origin === origin) {
        obj.type = _type;
      }
    }
  }
  obj = {
    type,
    origin,
    owner,
    name,
    checkout,
    ...obj,
  };
  obj.url = buildUrl(obj, clone);
  return obj;
}

const download = (
  repoUrl: string,
  dest: string,
  opts: Record<string, any> | ((e?: any) => void),
  fn?: (e?: any) => void,
) => {
  if (typeof opts === 'function') {
    fn = opts as (e?: any) => void;
    opts = {};
  }
  opts = (opts || {}) as Record<string, string>;
  const clone = (opts.clone || false) as boolean;
  delete opts.clone;

  const repo = normalize(repoUrl, clone);
  const { url } = repo;

  if (clone) {
    const cloneOptions = {
      checkout: repo.checkout,
      shallow: repo.checkout,
      ...opts,
    };
    gitclone(url, dest, cloneOptions, (err) => {
      if (err === undefined) {
        rm(`${dest}/.git`);
        fn && fn();
      } else {
        fn && fn(err);
      }
    });
  } else {
    const headers = (opts.headers as unknown) as {
      [name: string]: string;
    };
    const downloadOptions: downloadUrl.DownloadOptions = {
      ...opts,
      extract: true,
      strip: 1,
      // mode: '666',
      headers: {
        accept: 'application/zip',
        ...headers,
      },
    };
    downloadUrl(url, dest, downloadOptions)
      .then(() => {
        fn && fn();
      })
      .catch((err) => {
        fn && fn(err);
      });
  }
};
export default download;
