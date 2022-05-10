import { DataElement, DataElementState } from 'scarlet/types';

type SortDataElement = {
  dataElement: DataElement;
  value?: string;
  label: string;
};

export const sortDataElements = (a: SortDataElement, b: SortDataElement) => {
  const result = getSortingRank(a) - getSortingRank(b);
  if (result === 0) {
    return a.label < b.label ? -1 : 1;
  }

  return result;
};

const getSortingRank = ({ dataElement, value }: SortDataElement) => {
  let rate = 0;
  if (dataElement.state === DataElementState.OMITTED) {
    rate += 1000000;
  } else if (dataElement.state === DataElementState.APPROVED) {
    rate += 100000;
  } else if ([undefined, null, ''].includes(value)) {
    rate += 10000;
  }

  return rate;
};
