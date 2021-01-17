module.exports = {
  extends: [
    './configs/react',
    './configs/prettier',
  ].map(require.resolve),
};
