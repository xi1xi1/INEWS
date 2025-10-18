import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    // 忽略文件
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'coverage/**',
      '*.config.js'
    ],
  },
  {
    // JavaScript/JSX 文件配置
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
    ],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2020,
        React: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: 'module',
      },
    },
    rules: {
      // React Hooks 规则
      ...reactHooks.configs.recommended.rules,
      
      // React Refresh
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // 自定义规则
      'no-unused-vars': [
        'warn',
        { 
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^[A-Z]'
        }
      ],
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      
      // React 相关
      'react-hooks/exhaustive-deps': 'warn',
      
      // 代码风格
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'off',
      'quote-props': ['warn', 'as-needed'],
    },
  },
  {
    // 配置文件特定规则
    files: ['**/*.config.js'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
])