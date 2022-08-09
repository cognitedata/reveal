import { Row } from 'react-table';

type WellName = { wellName?: string };

export const getWellNameTableSort = <T extends WellName>(
  wellA: Row<T>,
  wellB: Row<T>
) => {
  return getWellNameSort(wellA.original, wellB.original);
};

export const getWellNameSort = <T extends WellName>(wellA: T, wellB: T) => {
  const { wellName: wellNameA } = wellA;
  const { wellName: wellNameB } = wellB;

  if (!wellNameA) return -1;
  if (!wellNameB) return 1;

  return wellNameA.localeCompare(wellNameB);
};
