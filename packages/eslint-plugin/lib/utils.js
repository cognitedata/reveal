const getDocsUrl = (ruleName) => {
  return `https://github.com/cognitedata/frontend/tree/master/packages/dev/eslint-plugin/docs/rules/${ruleName}.md`;
};

const isDirectiveComment = (node) => {
  const comment = node.value.trim();

  return (
    (node.type === 'Line' && comment.indexOf('eslint-') === 0) ||
    (node.type === 'Block' &&
      (comment.indexOf('global ') === 0 ||
        comment.indexOf('eslint ') === 0 ||
        comment.indexOf('eslint-') === 0))
  );
};

module.exports = {
  getDocsUrl,
  isDirectiveComment,
};
