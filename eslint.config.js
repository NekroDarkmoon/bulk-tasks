import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';
import path from 'path';
import importPlugin from 'eslint-plugin-import';
import sveltePlugin from 'eslint-plugin-svelte';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

export default [
  ...compat.extends('airbnb-base', 'airbnb-typescript/base'),
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: {
      import: importPlugin,
      svelte: sveltePlugin
    },
    rules: {
      '@typescript-eslint/brace-style': 'off',
      '@typescript-eslint/comma-dangle': 'off',
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/no-undef': 'off',
      '@typescript-eslint/naming-convention': 'off',
      'class-methods-use-this': 'off',
      'comma-dangle': 'off',
      'no-constant-binary-expression': 'error',
      'no-underscore-dangle': 'off',
      'no-use-before-define': 'off',
      'no-restricted-syntax': 'off',
      'no-param-reassign': 'off',
      'no-continue': 'off',
      'import/extensions': 'off',
      'import/prefer-default-export': 'off',
      'import/no-extraneous-dependencies': 'off',
    }
  }
];