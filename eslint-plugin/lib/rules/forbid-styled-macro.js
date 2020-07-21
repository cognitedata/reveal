/**
 * @fileoverview Rule to import styled-components/macro when using styled-components
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
      description: 'Should not import styled-components/macro',
      recommended: false,
      url: getDocsUrl('forbid-styled-macro'),
    },
    fixable: 'code',
    messages: {
      'forbid-styled-macro':
        'Please do not import from styled-components/macro.',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (
          node.source.value !== undefined &&
          node.source.value === 'styled-components/macro'
        ) {
          context.report({
            node,
            messageId: 'forbid-styled-macro',
            fix: (fixer) => {
              return fixer.replaceTextRange(
                node.source.range,
                `'styled-components'`
              );
            },
          });
        }
      },
    };
  },
};
