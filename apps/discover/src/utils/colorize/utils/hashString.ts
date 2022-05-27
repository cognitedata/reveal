import isEmpty from 'lodash/isEmpty';

export const hashString = (string: string) => {
  const trimmedString = string.trim();

  if (isEmpty(trimmedString)) {
    return 0;
  }

  return Array.from(trimmedString).reduce((value, character, index) => {
    return value + character.charCodeAt(0) * (index + 1);
  }, 0);
};
