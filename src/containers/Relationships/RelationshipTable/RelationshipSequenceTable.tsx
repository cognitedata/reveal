import React from 'react';

import { NewTable } from 'components/ReactTable';
import { useRelatedResourceResults, useRelationshipCount } from 'hooks';
import { ResultCount } from 'components';
import { Column } from 'react-table';
import { RelationshipTableProps } from './RelationshipTable';

import { SequenceWithRelationshipLabels } from 'index';
import { RelationshipFilters } from './RelationshipFilters';
import { EmptyState } from 'components/EmpyState/EmptyState';

const {
  relationshipLabels,
  relation,
  name,
  mimeType,
  uploadedTime,
  lastUpdatedTime,
  created,
} = NewTable.Columns;

const columns = [
  name,
  relationshipLabels,
  relation,
  mimeType,
  uploadedTime,
  lastUpdatedTime,
  created,
] as Column<SequenceWithRelationshipLabels>[];

export function RelationshipSequenceTable({
  parentResource,
  onItemClicked,
}: Omit<RelationshipTableProps, 'type'>) {
  const { data: count } = useRelationshipCount(parentResource, 'sequence');

  const {
    hasNextPage,
    fetchNextPage,
    isLoading,
    items,
    relationshipLabelOptions,
    onChangeLabelValue,
    labelValue,
  } = useRelatedResourceResults<SequenceWithRelationshipLabels>(
    'relationship',
    'sequence',
    parentResource
  );
  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
  }
  return (
    <>
      <RelationshipFilters
        options={relationshipLabelOptions}
        onChange={onChangeLabelValue}
        value={labelValue}
      />
      <NewTable
        columns={columns}
        tableHeaders={<ResultCount api="list" type="sequence" count={count} />}
        data={items}
        showLoadButton
        fetchMore={fetchNextPage}
        hasNextPage={hasNextPage}
        isLoadingMore={isLoading}
        onRowClick={row => onItemClicked(row.id)}
      />
    </>
  );
}
