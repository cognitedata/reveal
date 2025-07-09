/**
 * Constructs a Map out of key-value tuples, but ensures that values associated
 * with the same keys are concatenated
 */

export function concatenateMapValues<Key, Value>(
  tuples: Array<readonly [Key, Value[]]>
): Map<Key, Value[]> {
  return tuples.reduce((acc, tuple) => {
    const [key, newValues] = tuple;
    const previousValuesAtKey = acc.get(key);
    if (previousValuesAtKey !== undefined) {
      acc.set(key, previousValuesAtKey.concat(newValues));
    } else {
      acc.set(key, [...newValues]);
    }

    return acc;
  }, new Map<Key, Value[]>());
}

export function mergeMapsAndConcatenateValues<Key, Value>(
  map0: Map<Key, Value[]>,
  map1: Map<Key, Value[]>
): Map<Key, Value[]> {
  const entries = [...map0.entries(), ...map1.entries()];
  return concatenateMapValues(entries);
}

/**
 * Constructs a Map out of key-value tuples where the value are maps,
 * but merges the values for duplicate keys
 */
export function mergeMapValues<Key, InnerKey, Value>(
  tuples: Array<readonly [Key, Map<InnerKey, Value[]>]>
): Map<Key, Map<InnerKey, Value[]>> {
  return tuples.reduce((acc, tuple) => {
    const [key, newMapAtKey] = tuple;
    const previousMapAtKey = acc.get(key);
    if (previousMapAtKey !== undefined) {
      acc.set(key, mergeMapsAndConcatenateValues(previousMapAtKey, newMapAtKey));
    } else {
      acc.set(key, newMapAtKey);
    }

    return acc;
  }, new Map<Key, Map<InnerKey, Value[]>>());
}
