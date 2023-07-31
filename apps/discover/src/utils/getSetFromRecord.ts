export const getSetFromRecord = <T, U extends string | number>(
  itemsToExtractFromCache: Set<U>,
  cache: Record<U, T>
) => {
  return Array.from(itemsToExtractFromCache.keys()).reduce((result, id) => {
    if (cache[id]) {
      result.push(cache[id]);
    }
    return result;
  }, [] as T[]);
};
