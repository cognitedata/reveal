export const getDatumTypeDisplay = (reference: string): string => {
  return reference
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
};
