export const removeFirstAndlastCharactors = (input: string) => {
  if (input.length < 2) {
    return '';
  }
  return input.slice(1, -1);
};

export const capitalizeAndRemoveSpaces = (input: string): string => {
  return input
    .replace(/\b\w/g, (match) => match.toUpperCase()) // Capitalize the first letter of each word
    .replace(/\s/g, ''); // Remove all spaces
};
