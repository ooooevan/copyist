module.exports = {
  extends: [
    'prettier',
    'prettier/standard',
    'prettier/flowtype',
    'prettier/babel',
    'prettier/unicorn',
    'prettier/react',
    'prettier/vue',
    'prettier/@typescript-eslint',
  ],

  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        printWidth: 100,
        tabWidth: 2,
        useTabs: false,
        singleQuote: true,
        semi: true,
        bracketSpacing: true,
        quoteProps: 'as-needed',
        jsxSingleQuote: false,
        trailingComma: 'all',
        jsxBracketSameLine: false,
      },
    ],
  },
};
