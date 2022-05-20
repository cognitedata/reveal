import { Row } from 'react-table';

import { sortByCaseInsensitive } from 'utils/sort/sortByCaseInsensitive';

import { NdsDataLayer } from '../types';

type NdsSeverity = Pick<NdsDataLayer, 'severity'>;

export const getSeveritySort = <T extends NdsSeverity>(ndsA: T, ndsB: T) => {
  const severityA = ndsA.severity || 0;
  const severityB = ndsB.severity || 0;
  return sortByCaseInsensitive(severityA, severityB);
};

export const getSeverityTableSort = <T extends NdsSeverity>(
  ndsA: Row<T>,
  ndsB: Row<T>
) => {
  return getSeveritySort(ndsA.original, ndsB.original);
};
