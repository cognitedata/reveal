// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/forbid-styled-macro');

const parserOptions = { ecmaVersion: 8, sourceType: 'module' };

// ------------------------------------------------------------------------------
// Tests
// -------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions });

ruleTester.run('forbid-styled-macro', rule, {
  valid: [
    {
      code: "import styled from 'styled-components';",
    },
  ],
  invalid: [
    {
      code: "import styled from 'styled-components/macro';",
      errors: [{ messageId: 'forbid-styled-macro' }],
      output: "import styled from 'styled-components';",
    },
  ],
});
