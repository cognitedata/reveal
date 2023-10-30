export const removeFirstAndlastCharactors = (input: string) => {
  if (input.length < 2) {
    return '';
  }
  return input.slice(1, -1);
};
