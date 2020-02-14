/**
 * @fileoverview Rule to disallow z-index numbers in component props
 * @author Cameron Shum
 */

const { getDocsUrl } = require('../utils');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Use the z-index util for zIndex props',
      category: 'Best Practices',
      recommended: false,
      url: getDocsUrl('no-number-z-index'),
    },
    messages: {
      'no-number-z-index-property': 'zIndex property should use zIndex util',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (
          node.name.name === 'zIndex' &&
          node.value !== null &&
          node.value.expression.type === 'Literal' &&
          !Number.isNaN(node.value.expression.value)
        ) {
          context.report({
            node,
            messageId: 'no-number-z-index-property',
          });
        }
      },
    };
  },
};
