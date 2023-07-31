import { filterWellInspectNptData } from 'domain/wells/npt/internal/selectors/filterWellInspectNptData';

import * as React from 'react';

import { Loading } from 'components/Loading';
import { useDeepMemo } from 'hooks/useDeep';
import { useFilterDataNpt } from 'modules/inspectTabs/selectors';

import { useNptDataForTable } from '../hooks/useNptDataForTable';

import { NptWellsTable } from './NptWellsTable';

export const NptTable: React.FC = React.memo(() => {
  const { isLoading, data } = useNptDataForTable();
  const filterDataNpt = useFilterDataNpt();

  const filteredData = useDeepMemo(
    () => filterWellInspectNptData(data, filterDataNpt),
    [data, filterDataNpt]
  );

  if (isLoading) {
    return <Loading />;
  }

  return <NptWellsTable data={filteredData} />;
});
