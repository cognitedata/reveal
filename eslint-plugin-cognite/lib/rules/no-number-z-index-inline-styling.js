/**
 * @fileoverview Rule to disallow z-index numbers in inline styling
 */

const { getDocsUrl } = require('../utils');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Use the z-index util in inline styling',
      category: 'Best Practices',
      recommended: false,
      url: getDocsUrl('no-number-z-index'),
    },
    messages: {
      'no-number-z-index-inline-styling':
        'Inline zIndex styling should use zIndex util',
    },
    schema: [],
  },
  create(context) {
    return {
      Property(node) {
        if (
          node.key.name === 'zIndex' &&
          node.value.type === 'Literal' &&
          !Number.isNaN(node.value.value)
        ) {
          context.report({
            node,
            messageId: 'no-number-z-index-inline-styling',
          });
        }
      },
    };
  },
};
