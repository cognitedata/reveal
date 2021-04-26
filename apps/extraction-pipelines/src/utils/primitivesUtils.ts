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
