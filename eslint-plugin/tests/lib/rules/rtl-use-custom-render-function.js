// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/rtl-use-custom-render-function');

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

ruleTester.run('rtl-use-custom-render-function', rule, {
  valid: [
    { code: "import { render } from 'utils/tests';" },
    { code: "import { render as wrappedRender } from 'utils/tests';" },
    { code: "import render from 'utils/tests/render';" },
  ],
  invalid: [
    {
      code: "import { render } from '@testing-library/react';",
      errors: [
        {
          messageId: 'rtl-use-custom-render-function',
        },
      ],
    },
    {
      code:
        "import { render as originalRender } from '@testing-library/react';",
      errors: [
        {
          messageId: 'rtl-use-custom-render-function',
        },
      ],
    },
  ],
});
