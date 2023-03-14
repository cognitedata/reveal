export const splitCamelCase = (str: string) => {
  return str.replace(/([a-z](?=[A-Z]))/g, '$1 ');
};
export const capitalizeFirstLetter = (word: string) => {
  if (!word) return word;
  return word[0].toUpperCase() + word.slice(1);
};
export const getFilterOptionLabel = (optionName: string) => {
  return capitalizeFirstLetter(splitCamelCase(optionName).toLowerCase());
};
