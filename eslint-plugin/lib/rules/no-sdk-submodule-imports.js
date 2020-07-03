const { getDocsUrl } = require('../utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Import top-level exports from @cognite/sdk',
      category: 'Best Practices',
      recommended: true,
      url: getDocsUrl('no-sdk-submodule-imports'),
    },
    messages: {
      'no-sdk-submodule-imports':
        '@cognite/sdk imports should not import from submodules',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const {
          source: { type, value },
        } = node;
        if (type !== 'Literal') {
          return;
        }
        if (!value.startsWith('@cognite/sdk')) {
          return;
        }
        if (value !== '@cognite/sdk') {
          context.report({
            node,
            messageId: 'no-sdk-submodule-imports',
          });
        }
      },
    };
  },
};
