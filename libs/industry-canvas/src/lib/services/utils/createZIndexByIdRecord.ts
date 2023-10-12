const createZIndexByIdRecord = <
  T extends { id?: string; properties?: { zIndex?: number } }
>(
  items: T[]
): Record<string, number | undefined> => {
  return Object.fromEntries(
    items.map((item) => [`${item.id}`, item.properties?.zIndex])
  );
};

export default createZIndexByIdRecord;
