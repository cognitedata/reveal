const transformNode = (node) => {
  const code = node.value
    .trim()
    // allows new lines in jsx snippets
    .replace(/(\r\n|\n|\r)/gm, '\n')
    // handles backtick usage in jsx snippets
    .replace(/`/gm, '\\`')
    .replace(/\$/gm, '\\$');

  return [
    {
      type: 'jsx',
      value: '<LiveCodeSnippet>{`' + code + '`}</LiveCodeSnippet>',
    },
  ];
};

const versionedImportNode = {
  runnable: {
    type: 'import',
    value:
      "import { LiveCodeSnippet } from '@site/docs/components/LiveCodeSnippet';",
  },
  'runnable-1x': {
    type: 'import',
    value:
      "import { LiveCodeSnippet } from '@site/versioned_docs/version-1.x/components/LiveCodeSnippet';",
  },
  'runnable-2x': {
    type: 'import',
    value:
      "import { LiveCodeSnippet } from '@site/versioned_docs/version-2.x/components/LiveCodeSnippet';",
  },
  'runnable-3x': {
    type: 'import',
    value:
      "import { LiveCodeSnippet } from '@site/versioned_docs/version-3.x/components/LiveCodeSnippet';",
  }
};

module.exports = () => {
  let transformed = false;
  let importNode;
  const transformer = (node) => {
    if (node.type === 'code' && versionedImportNode[node.meta]) {
      transformed = true;
      importNode = versionedImportNode[node.meta];
      return transformNode(node);
    }
    if (Array.isArray(node.children)) {
      let index = 0;
      while (index < node.children.length) {
        const result = transformer(node.children[index]);
        if (result) {
          node.children.splice(index, 1, ...result);
          index += result.length;
        } else {
          index += 1;
        }
      }
    }
    if (node.type === 'root' && transformed) {
      node.children.unshift(importNode);
    }
    return null;
  };
  return transformer;
};
