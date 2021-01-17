module.exports = {
  extends: [
    './configs/core-ts',
    './configs/prettier',
  ].map(require.resolve),
};
