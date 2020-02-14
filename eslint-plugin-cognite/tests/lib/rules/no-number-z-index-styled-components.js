// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/no-number-z-index-styled-components');

const parserOptions = { ecmaVersion: 8, sourceType: 'module' };

// ------------------------------------------------------------------------------
// Tests
// -------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions });

ruleTester.run('no-number-z-index-styled-components', rule, {
  valid: [
    {
      code: 'const styledDiv = styled.div`z-index: zIndex.DIV;`',
    },
    {
      code: 'const styledDiv = styled(Div)`z-index: zIndex.DIV;`',
    },
    {
      code: 'const styledDiv = css`z-index: zIndex.DIV;`',
    },
  ],
  invalid: [
    {
      code: 'const styledDiv = styled.div`z-index: 5;`',
      errors: [{ messageId: 'no-number-z-index-styled-components' }],
    },
    {
      code: 'const styledDiv = styled(Div)`z-index: 5;`',
      errors: [{ messageId: 'no-number-z-index-styled-components' }],
    },
    {
      code: 'const styledDiv = css`z-index: 5;`',
      errors: [{ messageId: 'no-number-z-index-styled-components' }],
    },
  ],
});
