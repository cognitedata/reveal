export const getCasingSpecificationLabel = (
  diameterFormatted: string,
  isLiner = false
) => {
  const type = isLiner ? 'Liner' : 'Casing';

  return `${diameterFormatted} ${type} Specification`;
};
