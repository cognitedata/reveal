import { Row } from 'react-table';

import { sortByCaseInsensitive } from 'utils/sort/sortByCaseInsensitive';

import { NdsInternal } from '../types';

type NdsProbability = Pick<NdsInternal, 'probability'>;

export const getProbabilitySort = <T extends NdsProbability>(
  ndsA: T,
  ndsB: T
) => {
  const probabilityA = ndsA.probability || 0;
  const probabilityB = ndsB.probability || 0;
  return sortByCaseInsensitive(probabilityA, probabilityB);
};

export const getProbabilityTableSort = <T extends NdsProbability>(
  ndsA: Row<T>,
  ndsB: Row<T>
) => {
  return getProbabilitySort(ndsA.original, ndsB.original);
};
