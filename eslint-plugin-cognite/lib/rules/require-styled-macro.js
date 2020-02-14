/**
 * @fileoverview Rule to import styled-components/macro when using styled-components
 * @author Valerii Gusev
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
        'Should import styled-components/macro while using styled-components',
      recommended: false,
      url: getDocsUrl('require-styled-macro'),
    },
    fixable: 'code',
    messages: {
      'require-styled-macro': 'Please import from styled-components/macro.',
    },
    schema: [
      {
        type: 'string',
      },
    ],
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const name = 'styled-components';
        if (
          node.source.value.indexOf(name) > -1 &&
          node.source.value !== `${name}/macro`
        ) {
          context.report({
            node,
            messageId: 'require-styled-macro',
            fix: fixer => {
              return fixer.replaceTextRange(
                node.source.range,
                `'${name}/macro'`
              );
            },
          });
        }
      },
    };
  },
};
