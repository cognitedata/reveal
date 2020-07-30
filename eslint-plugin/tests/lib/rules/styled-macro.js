// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/styled-macro');

const parserOptions = { ecmaVersion: 8, sourceType: 'module' };

// ------------------------------------------------------------------------------
// Tests
// -------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions });

ruleTester.run('styled-macro', rule, {
  valid: [
    {
      code: "import styled from 'styled-components/macro';",
      // No options for the default case.
    },
    {
      code: "import styled from 'styled-components/macro';",
      options: ['require'],
    },
    {
      code: "import styled from 'styled-components';",
      options: ['forbid'],
    },
  ],
  invalid: [
    {
      code: "import styled from 'styled-components';",
      errors: [{ messageId: 'require-styled-macro' }],
      output: "import styled from 'styled-components/macro';",
      // No options for the default case.
    },
    {
      code: "import styled from 'styled-components';",
      errors: [{ messageId: 'require-styled-macro' }],
      output: "import styled from 'styled-components/macro';",
      options: ['require'],
    },
    {
      code: "import styled from 'styled-components/macro';",
      errors: [{ messageId: 'forbid-styled-macro' }],
      output: "import styled from 'styled-components';",
      options: ['forbid'],
    },
  ],
});
