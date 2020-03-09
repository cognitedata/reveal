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
        'react-i18next.Trans should have t function coming from withTranslation with custom context',
      recommended: false,
      url: getDocsUrl('require-t-function'),
    },
    messages: {
      'require-t-function':
        'Custom t function prop from withTranslation should be provided',
    },
    schema: [
      {
        type: 'string',
      },
    ],
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name && node.name.name === 'Trans') {
          let isTPassed = false;
          node.attributes.forEach(attribute => {
            if (attribute.name && attribute.name.name === 't') {
              isTPassed = true;
            }
          });
          if (!isTPassed) {
            context.report({
              node,
              messageId: 'require-t-function',
            });
          }
        }
      },
    };
  },
};
