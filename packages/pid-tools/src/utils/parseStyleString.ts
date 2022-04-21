const parseStyleString = (styleString: string): Record<string, string> => {
  const parsedStyle: Record<string, string> = {};
  styleString.split(';').forEach((styleKeyValueWithCollon) => {
    const keyValueList = styleKeyValueWithCollon.split(':');
    if (keyValueList.length !== 2) return;

    const [key, value] = keyValueList;
    parsedStyle[key] = value;
  });

  return parsedStyle;
};

export default parseStyleString;
