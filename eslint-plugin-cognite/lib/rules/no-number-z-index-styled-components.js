/**
 * @fileoverview Rule to disallow z-index numbers in styled components
 */

const { getDocsUrl } = require('../utils');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Use the z-index util in styled components',
      category: 'Best Practices',
      recommended: false,
      url: getDocsUrl('no-number-z-index'),
    },
    messages: {
      'no-number-z-index-styled-components':
        'z-index in a styled component should use zIndex util',
    },
    schema: [],
  },
  create(context) {
    return {
      TemplateElement(node) {
        const zIndex = 'z-index: ';
        const zIndexNum = node.value.raw.indexOf(zIndex);
        if (
          zIndexNum > -1 &&
          !Number.isNaN(Number(node.value.raw[zIndexNum + zIndex.length]))
        ) {
          const rawArray = node.value.raw.split('\n ');
          const zIndexLine = rawArray.findIndex(
            ele => ele.indexOf(zIndex) > -1
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
