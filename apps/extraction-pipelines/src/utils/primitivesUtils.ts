export const capitalizeWords = (value: string) => {
  const result = value.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};
export const uppercaseFirstWord = (value: string) => {
  const result = value
    .split(/(?=[A-Z])/)
    .map((w) => w.toLowerCase())
    .join(' ');
  return result.charAt(0).toUpperCase() + result.slice(1);
};
