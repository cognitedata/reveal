import { Row } from 'react-table';

import { Npt } from '@cognite/sdk-wells';

type NptCode = Pick<Npt, 'nptCode'>;

export const getNptCodeTableSort = <T extends NptCode>(
  nptEventA: Row<T>,
  nptEventB: Row<T>
) => {
  return getNptCodeSort(nptEventA.original, nptEventB.original);
};

export const getNptCodeSort = <T extends NptCode>(
  nptEventA: T,
  nptEventB: T
) => {
  return nptEventA.nptCode?.localeCompare(nptEventB.nptCode || '');
};
