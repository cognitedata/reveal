import { is } from "unist-util-is";
import { visit } from "unist-util-visit";

/**
 * adapted from https://github.com/mrazauskas/docusaurus-remark-plugin-tab-blocks/blob/b7dab1533dc422df00ce965a87fef840a62255bb/index.js
 */

function getImportNodes(metaString) {

  const docsPath = getDocsPath(metaString);

  if (docsPath === undefined) {
    return undefined;
  }

  return {
    data: {
      estree: {
        body: [
          {
            source: {
              raw: `'@site/${docsPath}/components/LiveCodeSnippet'`,
              type: "Literal",
              value: `@site/${docsPath}/components/LiveCodeSnippet`,
            },
            specifiers: [
              {
                local: { name: "LiveCodeSnippet", type: "Identifier" },
                type: "ImportDefaultSpecifier",
              },
            ],
            type: "ImportDeclaration",
          },
        ],
        type: "Program",
      },
    },
    type: "mdxjsEsm",
    value: `import LiveCodeSnippet from '@site/${docsPath}/components/LiveCodeSnippet';`,
  };

  function getDocsPath(metaString) {
    switch(metaString) {
    case 'runnable': return 'docs';
    case 'runnable-1x': return 'versioned_docs/version-1.x';
    case 'runnable-2x': return 'versioned_docs/version-2.x';
    case 'runnable-3x': return 'versioned_docs/version-3.x';
    case 'runnable-4x': return 'versioned_docs/version-4.x';
    default: return undefined;
    }
  }
}

function createSnippet(codeNode) {
  return {
    type: 'mdxJsxFlowElement',
    name: 'LiveCodeSnippet',
    attributes: [],
    children: [{ type: 'text', value: codeNode.value }]
  };
}

function resolveConfig(options) {
  return {
    groupId: options.groupId,
    labels: new Map([
      ["js", "JavaScript"],
      ["ts", "TypeScript"],
      ...(options.labels || []),
    ]),
    sync: options.sync ?? true,
  };
}

function plugin(options = {}) {
  const config = resolveConfig(options);

  return function transformer(tree) {
    let importNodes = undefined;

    visit(tree, ['code', 'mdxjsEsm'], (node, index, parent) => {
      if (!node.meta?.includes('runnable')) {
        return;
      }

      importNodes = getImportNodes(node.meta);

      parent.children[index] = createSnippet(node);
    });

    if (importNodes !== undefined) {
      tree.children.unshift(importNodes);
    }
  };
}

export default plugin;
