import { DataElement, DataElementState } from 'scarlet/types';

export const sortDataElements =
  (sortedKeys?: string[]) =>
  (
    a: { dataElement: DataElement; value?: string },
    b: { dataElement: DataElement; value?: string }
  ) =>
    getSortingRank(a, sortedKeys) - getSortingRank(b, sortedKeys);

const getSortingRank = (
  { dataElement, value }: { dataElement: DataElement; value?: string },
  sortedKeys: string[] = []
) => {
  let rate = 0;
  if (dataElement.state === DataElementState.APPROVED) {
    rate += 1000000;
  } else if (![undefined, null, ''].includes(value)) {
    rate += 100000;
  }

  let sortKeysRate = sortedKeys.indexOf(dataElement.key);
  if (sortKeysRate === -1) sortKeysRate = 10000;

  rate += sortKeysRate;

  return rate;
};
