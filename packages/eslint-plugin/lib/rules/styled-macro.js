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
      description: 'Enforce the correct style-components/macro usage',
      recommended: false,
      url: getDocsUrl('styled-macro'),
    },
    fixable: 'code',
    messages: {
      'require-styled-macro': 'Please import from styled-components/macro.',
      'forbid-styled-macro': 'Please do not use styled-components/macro.',
    },
    schema: [{ enum: ['require', 'forbid'] }],
  },
  create(context) {
    const [mode = 'require'] = context.options;
    const replacements = ['styled-components', 'styled-components/macro'];

    if (mode === 'forbid') {
      replacements.reverse();
    }

    const [search, replace] = replacements;

    return {
      ImportDeclaration(node) {
        if (node.source.value !== undefined && node.source.value === search) {
          context.report({
            node,
            messageId: `${mode}-styled-macro`,
            fix: (fixer) => {
              return fixer.replaceTextRange(node.source.range, `'${replace}'`);
            },
          });
        }
      },
    };
  },
};
