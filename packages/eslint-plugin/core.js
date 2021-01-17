module.exports = {
  extends: [
    './configs/core',
    './configs/prettier',
  ].map(require.resolve),
};
