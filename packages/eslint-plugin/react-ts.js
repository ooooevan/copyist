module.exports = {
  extends: [
    './configs/react-ts',
    './configs/prettier',
  ].map(require.resolve),
};
