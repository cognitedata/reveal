export const getTranslationEntry = (count: number) => {
  if (count !== 1) {
    return 'other';
  }

  return 'one';
};
