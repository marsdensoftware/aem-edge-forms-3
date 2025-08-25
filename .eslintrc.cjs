module.exports = {
  root: true,
  plugins: ['@stylistic'],
  extends: [
    'airbnb-base',
    'plugin:json/recommended',
    'plugin:xwalk/recommended',
  ],
  env: {
    browser: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    semi: 'off',
    quotes: ['error', 'single'], // WARNING: DO NOT run --fix on .json files
    indent: ['error', 2],
    devDependencies: [0, false],
    '@stylistic/max-len': [2, {
      code: 130, comments: 130, ignoreRegExpLiterals: true, ignorePattern: 'replaceAll\\(\'', ignoreTrailingComments: true,
    }],
    '@stylistic/no-tabs': ['error', {}],
    'no-trailing-spaces': ['error', {}],
    'no-underscore-dangle': ['off'], // we probably won't use EC22, so _ convention is ok
    'no-restricted-syntax': ['off', 'ForOfStatement'],
    'no-unused-expressions': ['error', { allowTernary: true }],
    'no-nested-ternary': ['off'],
    'operator-linebreak': ['off', 'after'],
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': ['error', { props: false }], // allow modifying properties of param
    'import/prefer-default-export': ['off'],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.js',
          '**/*.spec.js',
          'playwright.config.js',
        ],
      },
    ],
    'xwalk/max-cells': [
      'error',
      {
        '*': 4, // default limit for all models
        form: 16,
        wizard: 12,
        'form-button': 7,
        'checkbox-group': 20,
        checkbox: 19,
        'date-input': 21,
        'drop-down': 20,
        email: 22,
        'file-input': 20,
        'form-fragment': 16,
        'form-image': 7,
        'multiline-input': 23,
        'number-input': 22,
        panel: 17,
        'radio-group': 20,
        'form-reset-button': 7,
        'form-submit-button': 7,
        'telephone-input': 20,
        'text-input': 23,
        accordion: 14,
        modal: 11,
        rating: 18,
        password: 20,
        tnc: 12,
        range: 19,
      },
    ],
    'xwalk/no-orphan-collapsible-fields': 'off', // Disable until enhancement is done for Forms properties
  },
};
