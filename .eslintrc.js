module.exports = {
  env: {
    browser: true,
    es2021: true,
    'jest/globals': true
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  overrides: [{
    files: ['src/**/*.ts', 'src/**/*.tsx']
  }],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'jest'
  ],
  rules: {
    'import/extensions': [0],
    'import/no-extraneous-dependencies': [0],
    'react/jsx-filename-extension': [2, { 'extensions': ['.tsx'] }],
    'max-len': [2, 150, 4],
    'no-unused-vars': [2, {'argsIgnorePattern': '^_'}],
    'no-plusplus': [0],
    'no-continue': [0]
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.ts', '.tsx']
     }
    }
  }
};
