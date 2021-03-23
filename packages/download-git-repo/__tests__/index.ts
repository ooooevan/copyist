/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable consistent-return */
import assert from 'assert';
import read from 'fs-readdir-recursive';
import path from 'path';
import { sync as rm } from 'rimraf';
import download from '../src';
import { Mapper } from '../src/interfaces';

describe('download-git-repo', () => {
  jest.setTimeout(20000);

  beforeEach(() => {
    rm('test/tmp');
  });

  const filter = (x: string) => x[0] !== '.';

  const topLevelDomain: Mapper = {
    github: '.com',
    gitlab: '.com',
    bitbucket: '.org',
    gitee: '.com',
  };

  const runStyle = (type: keyof Mapper, style: string) => {
    let clone = false;
    if (style === 'clones') {
      clone = true;
    }

    it(`${style} master branch by default`, (done) => {
      download(`${type}:flippidippi/download-git-repo-fixture`, 'test/tmp', { clone }, (err) => {
        if (err) return done(err);
        const actual = read(path.join(__dirname, 'test/tmp'), filter);
        const expected = read(path.join(__dirname, `test/fixtures/${type}/master`));
        assert.deepStrictEqual(actual, expected);
        done();
      });
    });

    it(`${style} a branch`, (done) => {
      download(
        `${type}:flippidippi/download-git-repo-fixture#my-branch`,
        'test/tmp',
        { clone },
        (err) => {
          if (err) return done(err);
          const actual = read(path.join(__dirname, 'test/tmp'), filter);
          const expected = read(path.join(__dirname, `test/fixtures/${type}/my-branch`));
          assert.deepStrictEqual(actual, expected);
          done();
        },
      );
    });

    it(`${style} a branch with slashes`, (done) => {
      download(
        `${type}:flippidippi/download-git-repo-fixture#my/branch/with/slashes`,
        'test/tmp',
        { clone },
        (err) => {
          if (err) return done(err);
          const actual = read(path.join(__dirname, 'test/tmp'), filter);
          const expected = read(
            path.join(__dirname, `test/fixtures/${type}/my-branch-with-slashes`),
          );
          assert.deepStrictEqual(actual, expected);
          done();
        },
      );
    });

    it(`${style} master branch with specific origin`, (done) => {
      download(
        `${type}:${type}${topLevelDomain[type]}:flippidippi/download-git-repo-fixture`,
        'test/tmp',
        { clone },
        (err) => {
          if (err) return done(err);
          const actual = read(path.join(__dirname, 'test/tmp'), filter);
          const expected = read(path.join(__dirname, `test/fixtures/${type}/master`));
          assert.deepStrictEqual(actual, expected);
          done();
        },
      );
    });

    it(`${style} master branch with specific origin and protocol`, (done) => {
      download(
        `${type}:https://${type}${topLevelDomain[type]}:flippidippi/download-git-repo-fixture`,
        'test/tmp',
        { clone },
        (err) => {
          if (err) return done(err);
          const actual = read(path.join(__dirname, 'test/tmp'), filter);
          const expected = read(path.join(__dirname, `test/fixtures/${type}/master`));
          assert.deepStrictEqual(actual, expected);
          done();
        },
      );
    });
  };

  const runType = (type: keyof Mapper) => {
    runStyle(type, 'downloads');

    runStyle(type, 'clones');

    it('clones master branch with specific origin without type', (done) => {
      download(
        `${type}${topLevelDomain[type]}:flippidippi/download-git-repo-fixture`,
        'test/tmp',
        { clone: true },
        (err) => {
          if (err) return done(err);
          const actual = read(path.join(__dirname, 'test/tmp'), filter);
          const expected = read(path.join(__dirname, `test/fixtures/${type}/master`));
          assert.deepStrictEqual(actual, expected);
          done();
        },
      );
    });

    it('clones master branch with specific origin and protocol without type', (done) => {
      download(
        `https://${type}${topLevelDomain[type]}:flippidippi/download-git-repo-fixture`,
        'test/tmp',
        { clone: true },
        (err) => {
          if (err) return done(err);
          const actual = read(path.join(__dirname, 'test/tmp'), filter);
          const expected = read(path.join(__dirname, `test/fixtures/${type}/master`));
          assert.deepStrictEqual(actual, expected);
          done();
        },
      );
    });
  };

  // describe('via github', () => {
  //   runType('github');
  //   it('downloads from github by default', (done) => {
  //     download('flippidippi/download-git-repo-fixture', 'test/tmp', (err) => {
  //       if (err) return done(err);
  //       const actual = read('test/tmp', filter);
  //       const expected = read('test/fixtures/github/master');
  //       assert.deepStrictEqual(actual, expected);
  //       done();
  //     });
  //   });
  // });

  describe('via gitlab', () => {
    runType('gitlab');
  });

  // describe('via bitbucket', () => {
  //   runType('bitbucket');
  // });

  describe('via direct', () => {
    it('downloads master branch', (done) => {
      download(
        'direct:https://gitlab.com/flippidippi/download-git-repo-fixture/repository/archive.zip',
        'test/tmp',
        (err) => {
          if (err) throw err;
          const actual = read(path.join(__dirname, 'test/tmp'), filter);
          const expected = read(path.join(__dirname, 'test/fixtures/gitlab/master'));
          assert.deepStrictEqual(actual, expected);
          done();
        },
      );
    });
    it('downloads master branch file filter', (done) => {
      download(
        'direct:https://gitlab.com/flippidippi/download-git-repo-fixture/repository/archive.zip',
        'test/tmp',
        { filter: (file: { path: string }) => file.path.slice(-3) === '.md' },
        (err) => {
          if (err) throw err;
          const actual = read(path.join(__dirname, 'test/tmp'), filter);
          const expected = read(path.join(__dirname, 'test/fixtures/gitlab/master-only-md'));
          assert.deepStrictEqual(actual, expected);
          done();
        },
      );
    });
    it('downloads a branch', (done) => {
      download(
        'direct:https://gitlab.com/flippidippi/download-git-repo-fixture/repository/archive.zip?ref=my-branch',
        'test/tmp',
        (err) => {
          if (err) throw err;
          const actual = read(path.join(__dirname, 'test/tmp'), filter);
          const expected = read(path.join(__dirname, 'test/fixtures/gitlab/my-branch'));
          assert.deepStrictEqual(actual, expected);
          done();
        },
      );
    });
    it('clones master branch', (done) => {
      download(
        'direct:https://gitlab.com/flippidippi/download-git-repo-fixture.git',
        'test/tmp',
        { clone: true },
        (err) => {
          if (err) throw err;
          const actual = read(path.join(__dirname, 'test/tmp'), filter);
          const expected = read(path.join(__dirname, 'test/fixtures/gitlab/master'));
          assert.deepStrictEqual(actual, expected);
          done();
        },
      );
    });
    it('clones a branch', (done) => {
      download(
        'direct:https://gitlab.com/flippidippi/download-git-repo-fixture.git#my-branch',
        'test/tmp',
        { clone: true },
        (err) => {
          if (err) throw err;
          const actual = read(path.join(__dirname, 'test/tmp'), filter);
          const expected = read(path.join(__dirname, 'test/fixtures/gitlab/my-branch'));
          assert.deepStrictEqual(actual, expected);
          done();
        },
      );
    });
    it('clones a branch because options', (done) => {
      download(
        'direct:https://gitlab.com/flippidippi/download-git-repo-fixture.git',
        'test/tmp',
        { clone: true, checkout: 'my-branch', shallow: false },
        (err) => {
          if (err) throw err;
          const actual = read(path.join(__dirname, 'test/tmp'), filter);
          const expected = read(path.join(__dirname, 'test/fixtures/gitlab/my-branch'));
          assert.deepStrictEqual(actual, expected);
          done();
        },
      );
    });
  });

  it('.git url', (done) => {
    download(
      'https://gitlab.com/flippidippi/download-git-repo.git',
      'test/tmp',
      { clone: true },
      (err) => {
        if (err) throw err;
        done();
      },
    );
  });
  it('use https instead of ssh', (done) => {
    download('gitlab:flippidippi/download-git-repo', 'test/tmp', { clone: true }, (err) => {
      if (err) throw err;
      done();
    });
  });
  it('download gitee', (done) => {
    download('https://gitee.com/ooooevan/download-git.git', 'test/tmp', { clone: true }, (err) => {
      if (err) throw err;
      done();
    });
  });
});
