module.exports = {
  env: {
    jest: true,
    mocha: true,
  },
  extends: ['eslint:recommended', 'airbnb-base'],
  settings: {
    'import/extensions': ['.js'],
    'import/resolver': {
      node: {
        extensions: ['.js'],
      },
    },
  },
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        mjs: 'never',
      },
    ],
  },
};
