// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/no-number-z-index');

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

ruleTester.run('no-number-z-index', rule, {
  valid: [
    { code: '<div style={{ zIndex: zIndex.DIV }}>Content</div>' },
    { code: '<div zIndex={zIndex.DIV}>Content</div>' },
    { code: 'const styledDiv = styled.div`z-index: zIndex.DIV;`' },
    { code: 'const styledDiv = styled(Div)`z-index: zIndex.DIV;`' },
    { code: 'const styledDiv = css`z-index: zIndex.DIV;`' },
  ],
  invalid: [
    {
      code: '<div style={{ zIndex: 5 }}>Content</div>',
      errors: [{ messageId: 'no-number-z-index-inline-styling' }],
    },
    {
      code: '<div zIndex={5}>Content</div>',
      errors: [{ messageId: 'no-number-z-index-property' }],
    },
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
