import { Mapper } from './interfaces';

export const zipMapper: Mapper = {
  github: '{origin}{owner}/{name}/archive/{checkout}.zip',
  gitlab: '{origin}{owner}/{name}/repository/archive.zip?ref={checkout}',
  bitbucket: '{origin}{owner}/{name}/get/{checkout}.zip',
  gitee: '{origin}{owner}/{name}/repository/archive.zip?ref={checkout}',
};

export const originMapper: Mapper = {
  github: 'github.com',
  gitlab: 'gitlab.com',
  bitbucket: 'bitbucket.org',
  gitee: 'gitee.com',
};
