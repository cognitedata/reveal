import isEmpty from 'lodash/isEmpty';

export const hashString = (text?: string) => {
  const trimmedString = text?.trim();

  if (isEmpty(trimmedString) || trimmedString === undefined) {
    return 0;
  }

  return Array.from(trimmedString).reduce((value, character, index) => {
    return value + character.charCodeAt(0) * (index + 1);
  }, 0);
};
