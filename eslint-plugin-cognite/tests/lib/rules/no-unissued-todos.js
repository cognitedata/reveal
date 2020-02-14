// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/no-unissued-todos');

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

ruleTester.run('no-unissued-todos', rule, {
  valid: [
    {
      code: '//TODO(OI-12): asd',
    },
    {
      code: '//TODO(OI-10000000): asd',
    },
    {
      code: '//TODO(OPSUP-100): asd',
    },
  ],
  invalid: [
    {
      code: '//TODO(): asd',
      errors: [
        {
          message: /'TODO' comments should include link to JIRA issue, e.g TODO\((OI|OPSUP)-[0-9]+\)/,
        },
      ],
    },
    {
      code: '//TODO(FARTS-123): asd',
      errors: [
        {
          message: /'TODO' comments should include link to JIRA issue, e.g TODO\((OI|OPSUP)-[0-9]+\)/,
        },
      ],
    },
  ],
});
