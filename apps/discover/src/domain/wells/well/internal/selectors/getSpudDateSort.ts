import { WellInternal } from 'domain/wells/well/internal/types';

import { Row } from 'react-table';

import { sortByDate } from 'utils/sort/sortByDate';

type WellSpudDate = Pick<WellInternal, 'spudDate'>;

export const getSpudDateTableSort = <T extends WellSpudDate>(
  wellA: Row<T>,
  wellB: Row<T>
) => {
  return getSpudDateSort(wellA.original, wellB.original);
};

export const getSpudDateSort = <T extends WellSpudDate>(wellA: T, wellB: T) => {
  return sortByDate(wellA.spudDate, wellB.spudDate);
};
