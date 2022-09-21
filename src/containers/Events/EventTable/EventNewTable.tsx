import React from 'react';
import { CogniteEvent } from '@cognite/sdk';
import { Column } from 'react-table';
import { NewTable as Table, TableProps } from 'components/ReactTable/Table';
import { getNewColumnsWithRelationshipLabels } from 'utils';
import { RelationshipLabels } from 'types';

export type EventWithRelationshipLabels = RelationshipLabels & CogniteEvent;
export const EventTable = (
  props: TableProps<EventWithRelationshipLabels> & RelationshipLabels
) => {
  const { relatedResourceType } = props;

  const columns = [
    Table.Columns.type,
    Table.Columns.description,
    Table.Columns.externalId,
    Table.Columns.lastUpdatedTime,
    Table.Columns.created,
    Table.Columns.id,
    Table.Columns.dataSet,
    Table.Columns.startTime,
    Table.Columns.endTime,
    Table.Columns.source,
    Table.Columns.assets,
  ] as Column<CogniteEvent>[];

  const isRelationshipTable = relatedResourceType === 'relationship';

  return (
    <Table<CogniteEvent>
      columns={getNewColumnsWithRelationshipLabels<CogniteEvent>(
        columns,
        isRelationshipTable
      )}
      data={props.data}
      visibleColumns={['type', 'description']}
    />
  );
};
