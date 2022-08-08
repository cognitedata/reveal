import React from 'react';
import { CogniteEvent } from '@cognite/sdk';
import { Table, TableProps } from 'components';
import { getColumnsWithRelationshipLabels } from 'utils';
import { RelationshipLabels } from 'types';

type EventWithRelationshipLabels = RelationshipLabels & CogniteEvent;
export const EventTable = (props: TableProps<EventWithRelationshipLabels>) => {
  const { relatedResourceType } = props;

  const columns = [
    Table.Columns.type,
    Table.Columns.description,
    Table.Columns.subtype,
    Table.Columns.externalId,
    Table.Columns.relationships,
    Table.Columns.lastUpdatedTime,
    Table.Columns.createdTime,
  ];

  const isRelationshipTable = relatedResourceType === 'relationship';

  return (
    <Table<CogniteEvent>
      columns={getColumnsWithRelationshipLabels(columns, isRelationshipTable)}
      {...props}
    />
  );
};
