const caseInsensitiveIncludes = (str: string, search: string | undefined) => {
  return str.toLowerCase().includes(search?.toLowerCase() ?? '');
};

export default caseInsensitiveIncludes;
