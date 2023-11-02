import React, { useMemo } from 'react';

import {
  getTableColumns,
  Table,
  TableProps,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';
import noop from 'lodash/noop';

import { CogniteEvent } from '@cognite/sdk';

import { getHiddenColumns, useTranslation } from '@data-exploration-lib/core';
import { InternalEventsData } from '@data-exploration-lib/domain-layer';

import { useEventsMetadataColumns } from '../Search';

import { Wrapper } from './elements';

export const EventDetailsTable = ({
  onRowClick = noop,
  onRowSelection = noop,
  ...props
}: Omit<TableProps<InternalEventsData>, 'columns'>) => {
  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);
  const { metadataColumns, setMetadataKeyQuery } = useEventsMetadataColumns();

  const columns = useMemo(
    () =>
      [
        tableColumns.type(),
        tableColumns.subtype(),
        tableColumns.description(),
        tableColumns.externalId(),
        tableColumns.lastUpdatedTime,
        tableColumns.created,
        tableColumns.id(),
        tableColumns.dataSet,
        tableColumns.startTime,
        tableColumns.endTime,
        tableColumns.source(),
        ...metadataColumns,
      ] as ColumnDef<CogniteEvent>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadataColumns]
  ) as ColumnDef<InternalEventsData>[];

  const hiddenColumns = getHiddenColumns(columns, ['type', 'description']);

  const onRowClickHandler = (row: InternalEventsData) => {
    if (props.enableSelection) {
      onRowClick(row);
      return;
    }

    onRowSelection(
      (old) => ({ ...old, [String(row.id)]: true }),
      [{ id: row.id, externalId: row.externalId, type: 'event' }]
    );
  };

  return (
    <Wrapper>
      <Table<InternalEventsData>
        columns={columns}
        hiddenColumns={hiddenColumns}
        columnSelectionLimit={4}
        onChangeSearchInput={setMetadataKeyQuery}
        showLoadButton
        enableSelection
        onRowClick={onRowClickHandler}
        {...props}
      />
    </Wrapper>
  );
};
