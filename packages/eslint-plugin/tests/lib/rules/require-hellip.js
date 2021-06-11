// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/require-hellip');

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

ruleTester.run('require-hellip', rule, {
  valid: [
    { code: '<div>Updating&hellip;</div>' },
    { code: '<div>Updating…</div>' },
    { code: `const foo = 'Updating…';` },
  ],
  invalid: [
    {
      code: '<div>Updating...</div>',
      errors: [{ messageId: 'require-hellip' }],
      output: `<div>Updating&hellip;</div>`,
    },
    {
      code: `const foo = 'Updating ...';`,
      errors: [{ messageId: 'require-hellip' }],
      output: `const foo = 'Updating …';`,
    },
  ],
});
