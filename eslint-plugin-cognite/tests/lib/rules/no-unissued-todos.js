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

const errorMessage = /'TODO' comments should include link to JIRA issue, e.g TODO\((OI|OPSUP)-[0-9]+\)/;

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
    {
      code: '// TODO(PROJECT-101)',
      options: [{ issuePattern: '\\(((PROJECT)-[0-9]+)\\)' }],
    },
    {
      code: '// TODO(OI-1): test with space before TODO',
    },
    {
      code: '// @TODO(OI-12): support for jsdoc style todo',
    },
  ],
  invalid: [
    {
      code: '//TODO(): asd',
      errors: [
        {
          message: errorMessage,
        },
      ],
    },
    {
      code: '//TODO(FARTS-123): asd',
      errors: [
        {
          message: errorMessage,
        },
      ],
    },
  ],
});
