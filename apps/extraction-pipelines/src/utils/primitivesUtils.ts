export const capitalizeWords = (value: string) => {
  const result = value.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};
export const uppercaseFirstWord = (value: string) => {
  const result = splitWordsLowerCase(value);
  return result.charAt(0).toUpperCase() + result.slice(1);
};
export const splitWordsLowerCase = (value: string) => {
  return value
    .split(/(?=[A-Z])/)
    .map((w) => w.toLowerCase())
    .join(' ');
};

export const toCamelCase = (value: string) => {
  const temp = value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  return temp.charAt(0).toLowerCase() + temp.slice(1);
};

export const isUrl = (text: string): boolean => {
  try {
    const url = new URL(text);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch (_) {
    return false;
  }
};
