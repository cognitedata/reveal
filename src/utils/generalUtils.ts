export function splitListIntoChunks<T>(items: T[], batchSize: number): T[][] {
  if (batchSize <= 0) return [items];
  if (!items.length) return [[]];
  return items.reduce((acc, _, i) => {
    if (i % batchSize === 0) {
      acc.push(items.slice(i, i + batchSize));
    }
    return acc;
  }, [] as T[][]);
}
