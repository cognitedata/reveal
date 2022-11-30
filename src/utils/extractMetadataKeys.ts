export const extractMetadataKeys = <
  T extends { metadata?: Record<string, string> }[]
>(
  items: T
) => {
  const set = new Set<string>();

  items
    .flatMap(item => Object.keys(item?.metadata || {}))
    .forEach(key => {
      set.add(key);
    });

  return Array.from(set);
};
