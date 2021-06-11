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
      description: 'Use the z-index util to avoid hard-coding z-indexes',
      category: 'Best Practices',
      recommended: false,
      url: getDocsUrl('no-number-z-index'),
    },
    messages: {
      'no-number-z-index-inline-styling':
        'Inline zIndex styling should use zIndex util',
      'no-number-z-index-property': 'zIndex property should use zIndex util',
      'no-number-z-index-styled-components':
        'z-index in a styled component should use zIndex util',
    },
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

      TemplateElement(node) {
        const zIndex = 'z-index: ';
        const zIndexNum = node.value.raw.indexOf(zIndex);
        if (
          zIndexNum > -1 &&
          !Number.isNaN(Number(node.value.raw[zIndexNum + zIndex.length]))
        ) {
          const rawArray = node.value.raw.split('\n ');
          const zIndexLine = rawArray.findIndex(
            (ele) => ele.indexOf(zIndex) > -1
          );
          const line = zIndexLine + node.loc.start.line;
          context.report({
            node,
            loc: {
              start: {
                line,
                column: 2,
              },
              end: {
                line,
                column: rawArray[zIndexLine].length,
              },
            },
            messageId: 'no-number-z-index-styled-components',
          });
        }
      },
    };
  },
};
