// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // The Angular 22 `ng update` migration set `ChangeDetectionStrategy.Eager`
      // on pre-existing components to preserve their pre-v22 default behavior.
      // Converting them to real OnPush is a behavior change outside the scope of
      // this dependency upgrade, so this newly-recommended rule is disabled here
      // rather than silently changing runtime behavior.
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      '@angular-eslint/component-selector': [
        'error',
        {
          prefix: 'lib',
          style: 'kebab-case',
          type: 'element',
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          prefix: 'lib',
          style: 'camelCase',
          type: 'attribute',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended],
    rules: {},
  },
);
