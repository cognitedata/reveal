/**
 * @fileoverview Rule to use horizontal ellipsis (… / &hellip;) instead of three dots.
 */

const { getDocsUrl } = require('../utils');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const HELLIP = '…';

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      category: 'Best Practices',
      description: `The horizontal ellipsis (${HELLIP} / &hellip;) character should be used.`,
      recommended: false,
      url: getDocsUrl('require-hellip'),
    },
    fixable: 'code',
    messages: {
      'require-hellip': `The horizontal ellipsis character (${HELLIP} / &hellip;) should be used`,
    },
  },
  create(context) {
    return {
      JSXText(node) {
        if (!node.value.includes('...')) {
          return;
        }
        context.report({
          node,
          messageId: 'require-hellip',
          fix: (fixer) => {
            return fixer.replaceText(
              node,
              node.value.replace(/\.\.\./g, '&hellip;')
            );
          },
        });
      },
      Literal(node) {
        if (!node) {
          // These are things like null, undefined, etc
          return;
        }
        if (!node.value) {
          // Not sure what this is, but we can't process it.
          return;
        }
        if (!node.value.includes) {
          // This isn't a string literal.
          return;
        }
        if (!node.value.includes('...')) {
          // This is safe -- no ... to be found :)
          return;
        }
        context.report({
          node,
          messageId: 'require-hellip',
          fix: (fixer) => {
            return fixer.replaceTextRange(
              node.range,
              node.raw.replace(/\.\.\./g, HELLIP)
            );
          },
        });
      },
    };
  },
};
