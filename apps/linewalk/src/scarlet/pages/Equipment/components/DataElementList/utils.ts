import { DataElement, DataElementState } from 'scarlet/types';

export const sortDataElements =
  (sortedKeys?: string[]) => (a: DataElement, b: DataElement) =>
    getSortingRank(a, sortedKeys) - getSortingRank(b, sortedKeys);

const getSortingRank = (element: DataElement, sortedKeys: string[] = []) => {
  let rate = 0;
  if (element.state === DataElementState.APPROVED) {
    rate += 1000000;
  } else if (![undefined, null, ''].includes(element.value)) {
    rate += 100000;
  }

  let sortKeysRate = sortedKeys.indexOf(element.key);
  if (sortKeysRate === -1) sortKeysRate = 10000;

  rate += sortKeysRate;

  return rate;
};
