import React from 'react';
import { Sequence } from '@cognite/sdk';
import { useSelectionCheckbox } from 'hooks/useSelection';
import { useResourceMode } from 'context/ResourceSelectionContext';
import { ResourceTable, ResourceTableColumns } from 'components/Common';

const ActionCell = ({ sequence }: { sequence: Sequence }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: sequence.id, type: 'sequence' });
};

export const SequenceTable = ({
  filter,
  query,
  onSequenceClicked,
}: {
  filter?: any;
  query?: string;
  onSequenceClicked: (sequence: Sequence) => void;
}) => {
  const { mode } = useResourceMode();

  const columns = [
    ResourceTableColumns.name,
    ResourceTableColumns.externalId,
    ResourceTableColumns.columns,
    ResourceTableColumns.lastUpdatedTime,
    ResourceTableColumns.createdTime,
    ...(mode !== 'none'
      ? [
          {
            ...ResourceTableColumns.select,

            cellRenderer: ({ rowData: sequence }: { rowData: Sequence }) => {
              return <ActionCell sequence={sequence} />;
            },
          },
        ]
      : []),
  ];

  return (
    <ResourceTable<Sequence>
      api="sequences"
      filter={filter}
      query={query}
      columns={columns}
      onRowClick={onSequenceClicked}
    />
  );
};
