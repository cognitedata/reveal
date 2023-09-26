// This function defines a comparator that defines an order between two items A
// and B based on their zIndex. The one with the lower zIndex should end up
// first in the resulting sorted array. Moreover, if the zIndex is undefined,
// then the original *relative order* should be maintained
const compareItemsByZIndex = <T extends { id: string }>(
  a: T,
  b: T,
  zIndexById: Record<string, number | undefined>
): number => {
  const zIndexA = zIndexById[a.id];
  const zIndexB = zIndexById[b.id];
  // Maintain the current order (i.e., the relative positions) if zIndexA nor zIndexB is specified
  if (zIndexA === undefined && zIndexB === undefined) {
    return 0;
  }
  // `a` should be moved to the end if its zIndex is undefined
  if (zIndexA === undefined) {
    return 1;
  }
  // `b` should be moved to the end if its zIndex is undefined
  if (zIndexB === undefined) {
    return -1;
  }
  // Sort by zIndex
  return zIndexA - zIndexB;
};

export default compareItemsByZIndex;
