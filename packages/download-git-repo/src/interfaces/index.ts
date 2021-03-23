export interface RepoInfo {
  // url?: string;
  // type?: string;
  // origin?: string;
  // owner?: string;
  // name?: string;
  // checkout?: string;
  [k: string]: string;
}

export interface Mapper {
  github: string;
  gitlab: string;
  bitbucket: string;
  gitee: string;
  [k: string]: string;
}
