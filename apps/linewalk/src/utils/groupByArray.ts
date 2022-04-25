const groupByArray = <T>(
  array: T[],
  keys: (item: T) => string[]
): Record<string, T[]> => {
  const elementsByKey: Record<string, T[]> = {};
  array.forEach((element) =>
    keys(element).forEach((key) => {
      if (!elementsByKey[key]) {
        elementsByKey[key] = [];
      }
      elementsByKey[key].push(element);
    })
  );
  return elementsByKey;
};

export default groupByArray;
