export const getPrintedUnitName = (unitName: string) => {
  const matches = unitName.match(/G(\d+)/);
  if (matches) return `Unit ${parseInt(matches[1], 10)}`;

  return unitName;
};
