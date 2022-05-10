import trim from 'lodash/trim';
import upperCase from 'lodash/upperCase';

export const convertToUpperCase = (
  input: number | string | undefined
): string => {
  if (!input) {
    return '';
  }

  return trim(upperCase(input.toString()));
};
