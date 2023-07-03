const caseInsensitiveIncludes = (
  str: string | undefined,
  search: string | undefined
) => {
  if (str === undefined) {
    return false;
  }
  return str.toLowerCase().includes(search?.toLowerCase() ?? '');
};

export default caseInsensitiveIncludes;
