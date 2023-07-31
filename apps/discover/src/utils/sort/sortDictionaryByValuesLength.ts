import size from 'lodash/size';

type Dictionary<T> = {
  [id: string | number]: T | undefined;
};

export const sortDictionaryByValuesLength = <T>(list: Dictionary<T[]>) => {
  const sortedKeys = Object.keys(list).sort(
    (previousKey: string, nextKey: string) => {
      return size(list[nextKey]) - size(list[previousKey]);
    }
  );

  return sortedKeys.reduce((sortedList, nextKey) => {
    return { ...sortedList, [nextKey]: size(list[nextKey]) };
  }, {} as { [key: string]: number });
};
