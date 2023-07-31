const splitBy = <T>(
  collection: T[],
  predicate: (element: T, index: number, arr: T[]) => boolean
): T[][] => {
  const result: T[][] = [];
  collection.forEach((element, index, arr) => {
    if (index === 0) {
      result.push([element]);
      return;
    }

    if (predicate(collection[index], index, arr)) {
      result.push([collection[index]]);
      return;
    }

    result[result.length - 1].push(collection[index]);
  });

  return result;
};

export default splitBy;
