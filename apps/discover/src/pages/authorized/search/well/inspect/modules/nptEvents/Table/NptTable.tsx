import { filterWellInspectNptData } from 'domain/wells/npt/internal/selectors/filterWellInspectNptData';

import React, { useMemo } from 'react';

import { useFilterDataNpt } from 'modules/inspectTabs/selectors';

import { NptView } from '../types';

import { NptWellsTable } from './NptWellsTable';

interface NptTableProps {
  data: NptView[];
}

export const NptTable: React.FC<NptTableProps> = React.memo(({ data }) => {
  const filterDataNpt = useFilterDataNpt();

  const filteredData = useMemo(
    () => filterWellInspectNptData(data, filterDataNpt),
    [data, filterDataNpt]
  );

  return <NptWellsTable data={filteredData} />;
});
