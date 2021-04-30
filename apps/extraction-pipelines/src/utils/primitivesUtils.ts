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
  const urlRegExp = new RegExp(
    /((https?):\/\/)(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/
  );
  return urlRegExp.test(text);
};
