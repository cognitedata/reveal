// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/require-t-function');

const parserOptions = {
  ecmaVersion: 2018,
  sourceType: 'module',
  ecmaFeatures: {
    jsx: true,
  },
};

// ------------------------------------------------------------------------------
// Tests
// -------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions });

ruleTester.run('require-t-function', rule, {
  valid: [
    {
      code: '<Trans t={t}>Text</Trans>',
    },
  ],
  invalid: [
    {
      code: '<Trans>Text</Trans>',
      errors: [
        {
          messageId: 'require-t-function',
        },
      ],
    },
  ],
});
