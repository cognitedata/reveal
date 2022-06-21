import { groupByWellName } from 'domain/wells/well/internal/transformers/groupByWellName';
import { keyByWellboreName } from 'domain/wells/wellbore/internal/transformers/keyByWellboreName';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import head from 'lodash/head';
import { sortTableData } from 'utils/sort/sortTableData';

import { Table, TableResults } from 'components/Tablev3';

import { CasingSchematicView } from '../types';
import { adaptToCasingAssemblyTableView } from '../utils/adaptToCasingAssemblyTableView';

import { CasingsWellboresTable } from './CasingsWellboresTable';
import { useCasingsWellsTableColumns } from './columns/useCasingsTableColumns';
import { CasingsWellsTableData } from './types';

interface CasingsWellsTableProps {
  data: CasingSchematicView[];
  onPreviewClick: (previewData: CasingSchematicView) => void;
}

const tableOptions = {
  expandable: true,
  flex: false,
  pagination: {
    enabled: true,
    pageSize: 50,
  },
};

export const CasingsWellsTable: React.FC<CasingsWellsTableProps> = ({
  data,
  onPreviewClick,
}) => {
  const columns = useCasingsWellsTableColumns();

  const [tableData, setTableData] = useState<CasingsWellsTableData[]>([]);
  const [expandedWells, setExpandedWells] = useState<TableResults>({});

  const dataGroupByWellName = useMemo(() => groupByWellName(data), [data]);
  const dataKeyByWellboreName = useMemo(() => keyByWellboreName(data), [data]);

  useEffect(() => {
    const tableData = Object.keys(dataGroupByWellName).map((wellName) => ({
      id: wellName,
      wellName,
      data: dataGroupByWellName[wellName],
    }));
    const firstRow = head(tableData);

    setTableData(tableData);
    setExpandedWells(firstRow ? { [firstRow.id]: true } : {});
  }, [dataGroupByWellName]);

  const handleRowClick = useCallback(
    ({ original }) => {
      const { wellName } = original;
      setExpandedWells({
        ...expandedWells,
        [wellName]: !expandedWells[wellName],
      });
    },
    [expandedWells]
  );

  const handlePreviewClick = (wellboreName: string) => {
    const wellboreCasingsData = dataKeyByWellboreName[wellboreName];
    onPreviewClick(wellboreCasingsData);
  };

  const renderRowSubComponent = useCallback(
    ({ row, sortBy }) => {
      const { data } = row.original;
      const casingAssemblies = adaptToCasingAssemblyTableView(data);
      const tableData = sortTableData(casingAssemblies, sortBy);

      return (
        <CasingsWellboresTable
          data={tableData}
          onPreviewClick={handlePreviewClick}
        />
      );
    },
    [tableData]
  );

  return (
    <Table<CasingsWellsTableData>
      scrollTable
      id="well-casings-table"
      data={tableData}
      columns={columns}
      options={tableOptions}
      expandedIds={expandedWells}
      handleRowClick={handleRowClick}
      renderRowSubComponent={renderRowSubComponent}
    />
  );
};
