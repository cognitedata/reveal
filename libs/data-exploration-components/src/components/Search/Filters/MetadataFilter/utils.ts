export const mergeUniqueMetadataKeys = <
  T extends { metadata?: { [key: string]: string } }
>(
  items: T[]
) => {
  // No need to extract metadata if keys are already supplied by the API
  const metadata = items.reduce((accumulator, item) => {
    Object.keys(item.metadata || {}).forEach(key => {
      if (item.metadata![key].length !== 0) {
        if (!accumulator[key]) {
          accumulator[key] = new Set<string>();
        }
        accumulator[key].add(item.metadata![key]);
      }
    });
    return accumulator;
  }, {} as { [key: string]: Set<string> });

  return Object.keys(metadata).reduce((accumulator, key) => {
    accumulator[key] = [...metadata[key]];
    return accumulator;
  }, {} as { [key: string]: string[] });
};
