export const getPrintedUnitName = (unitId: string) => {
  const matches = unitId.match(/G(\d+)/);
  if (matches) return `Unit ${parseInt(matches[1], 10)}`;

  return unitId;
};
