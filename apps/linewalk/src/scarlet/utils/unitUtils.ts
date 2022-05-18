export const getPrintedUnitName = (unitId: string, unitePattern?: RegExp) => {
  if (!unitePattern) return unitId;

  const matches = unitId.match(unitePattern);
  if (matches) return `Unit ${parseInt(matches[1], 10)}`;

  return unitId;
};
