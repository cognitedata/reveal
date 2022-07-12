import { NptView } from 'domain/wells/npt/internal/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import React, { useState } from 'react';
import { Row } from 'react-table';

import isEmpty from 'lodash/isEmpty';

import { Options, Table, TableResults } from 'components/Tablev3';
import { useDeepCallback, useDeepEffect } from 'hooks/useDeep';

import { PAGE_SIZE } from './constants';
import { useNptWellboresTableColumns } from './hooks/useHelpers';
import { NptEventsTable } from './NptEventsTable';
import { NptWellbore } from './types';

interface NptWellboresTableProps {
  data: NptView[];
}

const tableOptions: Options = {
  expandable: true,
  flex: false,
  pagination: {
    enabled: true,
    pageSize: PAGE_SIZE,
  },
  hideScrollbars: true,
};

export const NptWellboresTable: React.FC<NptWellboresTableProps> = ({
  data,
}) => {
  const [wellbores, setWellbores] = useState<NptWellbore[]>([]);
  const [expandedWellbores, setExpandedWellbores] = useState<TableResults>({});

  const nptWellboresTableColumns = useNptWellboresTableColumns();

  useDeepEffect(() => {
    const groupedData = groupByWellbore(data);
    const wellbores = Object.keys(groupedData).map((wellboreName) => ({
      id: wellboreName,
      wellboreName,
      data: groupedData[wellboreName],
    }));

    setWellbores(wellbores);
  }, [data]);

  useDeepEffect(() => {
    if (isEmpty(wellbores)) return;

    setExpandedWellbores({
      ...expandedWellbores,
      [wellbores[0].id]: true,
    });
  }, [wellbores]);

  const handleRowClick = useDeepCallback(
    (row: Row) => {
      const { id } = row.original as NptWellbore;

      setExpandedWellbores({
        ...expandedWellbores,
        [id]: !expandedWellbores[id],
      });
    },
    [expandedWellbores]
  );

  const renderRowSubComponent = useDeepCallback(
    ({ row }) => {
      const { data } = row.original as NptWellbore;
      return <NptEventsTable data={data} />;
    },
    [data]
  );

  return (
    <Table<NptWellbore>
      id="npt-table-wellbores"
      data={wellbores || []}
      columns={nptWellboresTableColumns}
      options={tableOptions}
      expandedIds={expandedWellbores}
      handleRowClick={handleRowClick}
      renderRowSubComponent={renderRowSubComponent}
      indent
      hideHeaders
    />
  );
};
