/**
 * Merge tuples into one map, and put values from duplicate keys in a list in the result Map
 */
export function concatenateMapValues<Key, Value>(
  tuples: Array<readonly [Key, Value]>
): Map<Key, Value[]> {
  return tuples.reduce((acc, [key, value]) => {
    const prevValue = acc.get(key);
    if (prevValue !== undefined) {
      prevValue.push(value);
    } else {
      acc.set(key, [value]);
    }
    return acc;
  }, new Map<Key, Value[]>());
}
