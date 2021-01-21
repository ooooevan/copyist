#!/usr/bin/env node
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import fs = require('fs-extra');
import path = require('path');
// import chalk = require('chalk');
import yargs = require('yargs');
import https = require('https');
import semver = require('semver');
import cp = require('child_process');

/** 获取cra的package.json */
function getPkg() {
  const filePath = path.join(__dirname, '../package.json');

  const content = fs.readFileSync(filePath).toString();
  const result = JSON.parse(content) as Record<string, string>;
  return result;
}

/** 确认node版本 */
function checkNodeVersion() {
  const version = process.versions.node;
  const major = +version.split('.')[0];
  if (major < 10) {
    console.error('node版本至少10，当前版本：', major);
    process.exit(1);
  }
}

/** 获取模块的最新版本信息 */
function getLatestVersion(moduleName: string) {
  const url = `https://registry.npmjs.org/-/package/${moduleName}/dist-tags`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        let body = '';
        res.on('data', (data) => {
          body += data;
        });
        res.on('end', () => {
          const result = JSON.parse(body) as { latest: string };
          resolve(result.latest);
        });
      } else {
        console.log(res);
        reject();
      }
    });
  });
}

/** 是否有yarn */
function shouldUseYarn() {
  try {
    cp.execSync('yarn --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

/** 确认react-scripts的node版本是否合适 */
function checkReactScriptVersion(module: string) {
  const reactScriptPkgStr = fs
    .readFileSync(path.join('node_modules', module, 'package.json'))
    .toString();
  const reactScriptPkg: any = JSON.parse(reactScriptPkgStr) as unknown;
  if (!reactScriptPkg.engines || !reactScriptPkg.engines.node) {
    return;
  }
  if (!semver.satisfies(process.versions.node, reactScriptPkg.engines.node)) {
    console.error(
      `当前node版本为：${process.versions.node}，${reactScriptPkg.name}模块需要node版本为：${reactScriptPkg.engines.node}，请升级node版本`,
    );
    process.exit(1);
  }
}

/** 查看目录是否有git仓库 */
function checkInGitRepository() {
  try {
    cp.execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

/** git commit */
function tryCommitGit() {
  try {
    cp.execSync('git add . && git commit -m "init project with cra"', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

/** git init */
function tryGitInit() {
  try {
    if (checkInGitRepository()) {
      return false;
    }
    cp.execSync('git init .', { stdio: 'ignore' });
    return true;
  } catch (e) {
    console.log('git初始化失败：', e);
    return false;
  }
}

/** 处理template，并commit */
function initTemplate(projectRoot: string, appName: string, template: string, useYarn: boolean) {
  const tempplatePath = path.resolve(projectRoot, 'node_modules', template);
  const templatePkg = require(path.join(tempplatePath, 'template.json'));
  if (!templatePkg || !templatePkg.package) {
    console.log('未发现template');
    process.exit(1);
  }
  const rootPkg = require(path.join(projectRoot, 'package.json'));
  const tempDependencies = { ...templatePkg.package.dependencies, ...rootPkg.dependencies };
  rootPkg.dependencies = tempDependencies;
  /** 将template复制到root */
  fs.copySync(path.join(tempplatePath, 'template'), projectRoot);
  /** 将template.json合并到package.json */
  fs.writeFileSync(path.join(projectRoot, 'package.json'), JSON.stringify(rootPkg, null, 2));
  fs.renameSync(path.join(projectRoot, 'gitignore'), path.join(projectRoot, '.gitignore'));

  if (tryGitInit()) {
    console.log('git初始化');
  }
  cp.execSync(useYarn ? 'yarn install' : 'npm install', { stdio: 'inherit' });
  if (tryCommitGit()) {
    console.log('git commit');
  }
  console.log('初始化成功');
}

/**
 * 下载react、react-dom、react-scripts、template
 */
function createApp({
  projectName,
  template,
  useNpm,
}: {
  projectName: string;
  template: string;
  useNpm: boolean;
}) {
  const projectRoot = path.resolve(projectName);
  fs.ensureDirSync(projectName);
  const appName = path.basename(projectRoot);
  const packageJson = {
    name: appName,
    version: '0.1.0',
    private: true,
  };
  fs.writeFileSync(path.resolve(projectRoot, 'package.json'), JSON.stringify(packageJson, null, 2));
  const useYarn = useNpm ? false : shouldUseYarn();
  const reactScriptModule = 'react-scripts';
  const templateModule = template ? `cra-template-${template}` : 'cra-template';
  // 需要下载的依赖
  const allDependencies = ['react', 'react-dom', reactScriptModule, templateModule];
  // 切换到project路径下
  process.chdir(projectRoot);
  let args = allDependencies;
  if (useYarn) {
    args = ['yarn', 'add'].concat(allDependencies);
  } else {
    args = ['npm', 'install'].concat(allDependencies);
  }
  // 命令行下载依赖，传入stdio才能看到命令输入
  cp.execSync(args.join(' '), { stdio: 'inherit' });

  checkReactScriptVersion(reactScriptModule);

  try {
    initTemplate(projectRoot, appName, templateModule, useYarn);
  } catch (e) {
    console.log('error:');
    console.log(e);
    fs.removeSync(projectRoot);
    process.exit(1);
  }
}

function init() {
  checkNodeVersion();
  const { argv } = yargs
    .usage('create-react-app <project-name>')
    .option('use-npm', {
      default: false,
      describe: '是否使用npm',
      type: 'boolean',
    })
    .option('template', {
      describe: '模板',
      type: 'string',
    })
    .help('h')
    .example('create-react-app my-app', 'init my-app')
    .example('create-react-app my-app --use-npm', '使用npm')
    .epilog('       _______');
  if (!argv._.length) {
    console.log('缺少<project-name>');
    process.exit(1);
  }
  const projectName = `${argv._[0]}`;
  console.log('模块名：', projectName);
  getLatestVersion('create-react-app')
    .catch(() => {
      try {
        return cp.execSync('npm view create-react-app version').toString();
      } catch (e) {
        return null;
      }
    })
    .then((latest: string | undefined | null) => {
      const pkg = getPkg();
      if (latest && semver.lt(pkg.version, latest)) {
        console.log(
          `当前版本为${pkg.version}，请下载最新版${latest}。或使用npx create-react-app <project-name>`,
        );
        // process.exit(1);
      }
      createApp({
        projectName,
        template: argv.template,
        useNpm: argv['use-npm'],
      });
    })
    .catch((e) => {
      console.log(e);
      process.exit(1);
    });
}

init();
