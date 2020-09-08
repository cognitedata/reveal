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

const matchNode = (node) => node.type === 'code' && node.meta === 'runnable';
const nodeForImport = {
  type: 'import',
  value:
    "import { LiveCodeSnippet } from '@site/src/components/LiveCodeSnippet';",
};

module.exports = () => {
  let transformed = false;
  const transformer = (node) => {
    if (matchNode(node)) {
      transformed = true;
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
      node.children.unshift(nodeForImport);
    }
    return null;
  };
  return transformer;
};
