import { Row } from 'react-table';

import { sortByDate } from 'utils/sort/sortByDate';

import { Well } from 'modules/wellSearch/types';

type WellSpudDate = Pick<Well, 'spudDate'>;

export const getSpudDateTableSort = <T extends WellSpudDate>(
  wellA: Row<T>,
  wellB: Row<T>
) => {
  return getSpudDateSort(wellA.original, wellB.original);
};

export const getSpudDateSort = <T extends WellSpudDate>(wellA: T, wellB: T) => {
  return sortByDate(wellA.spudDate, wellB.spudDate);
};
