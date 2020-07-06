/**
 * @fileoverview Rule to use t function when using withTranslation
 */

const { getDocsUrl } = require('../utils');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      category: 'Best Practices',
      description:
        'The render function from @testing-library/react should not be used. Use the wrapped version to set up the app boilerplate.',
      recommended: false,
      url: getDocsUrl('rtl-use-custom-render-function'),
    },
    messages: {
      'rtl-use-custom-render-function':
        'Use the wrapped render function, not directly from @testing-library/react',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const {
          source: { value: importValue },
          specifiers,
        } = node;
        if (importValue !== '@testing-library/react') {
          return;
        }

        specifiers.forEach(({ imported }) => {
          const { name } = imported;
          if (name !== 'render') {
            return;
          }
          context.report({
            node: imported,
            messageId: 'rtl-use-custom-render-function',
          });
        });
      },
    };
  },
};
