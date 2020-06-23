// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/require-styled-macro');

const parserOptions = { ecmaVersion: 8, sourceType: 'module' };

// ------------------------------------------------------------------------------
// Tests
// -------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions });

ruleTester.run('require-styled-macro', rule, {
  valid: [
    {
      code: "import styled from 'styled-components/macro';",
    },
  ],
  invalid: [
    {
      code: "import styled from 'styled-components';",
      errors: [{ messageId: 'require-styled-macro' }],
      output: "import styled from 'styled-components/macro';",
    },
  ],
});
