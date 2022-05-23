export const getPrintedUnitName = (unitId: string, unitePattern?: RegExp) => {
  if (!unitePattern) return unitId;

  const matches = unitId.match(unitePattern);
  if (matches) return `Unit ${parseFloat(matches[1])}`;

  return unitId;
};
