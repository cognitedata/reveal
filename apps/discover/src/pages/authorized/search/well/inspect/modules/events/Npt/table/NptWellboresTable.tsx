import React, { useEffect, useCallback, useState } from 'react';
import { Row } from 'react-table';

import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';

import { Options, Table, TableResults } from 'components/Tablev3';
import { NPTEvent } from 'modules/wellSearch/types';

import { accessors } from '../constants';

import { PAGE_SIZE } from './constants';
import { useNptWellboresTableColumns } from './hooks/useHelpers';
import { NptEventsTable } from './NptEventsTable';
import { NPTWellbore } from './types';

export const NptWellboresTable: React.FC<{ events: NPTEvent[] }> = ({
  events,
}) => {
  const [wellbores, setWellbores] = useState<NPTWellbore[]>([]);
  const [expandedWellbores, setExpandedWellbores] = useState<TableResults>({});

  const nptWellboresTableColumns = useNptWellboresTableColumns();

  const tableOptions: Options = {
    expandable: true,
    flex: false,
    pagination: {
      enabled: true,
      pageSize: PAGE_SIZE,
    },
    hideScrollbars: true,
  };

  useEffect(() => {
    const groupedNptEvents = groupBy(events, accessors.WELLBORE_NAME);
    const wellbores = Object.keys(groupedNptEvents).map((wellboreName) => ({
      id: wellboreName,
      wellboreName,
      events: get(groupedNptEvents, wellboreName),
    }));

    setWellbores(wellbores);
  }, [events]);

  useEffect(() => {
    if (isEmpty(wellbores)) return;

    setExpandedWellbores({
      ...expandedWellbores,
      [wellbores[0].id]: true,
    });
  }, [wellbores]);

  const handleRowClick = useCallback(
    (row: Row) => {
      const { id } = row.original as NPTWellbore;

      setExpandedWellbores({
        ...expandedWellbores,
        [id]: !expandedWellbores[id],
      });
    },
    [expandedWellbores]
  );

  const renderRowSubComponent = useCallback(
    ({ row }) => {
      const { events } = row.original as NPTWellbore;

      return <NptEventsTable events={events} />;
    },
    [events, wellbores]
  );

  return (
    <Table<NPTWellbore>
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
