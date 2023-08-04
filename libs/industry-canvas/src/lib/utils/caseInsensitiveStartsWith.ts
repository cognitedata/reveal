const caseInsensitiveStartsWith = (
  str: string | undefined,
  search: string | undefined
) => {
  if (str === undefined) {
    return false;
  }
  return str.toLowerCase().startsWith(search?.toLowerCase() ?? '');
};

export default caseInsensitiveStartsWith;
