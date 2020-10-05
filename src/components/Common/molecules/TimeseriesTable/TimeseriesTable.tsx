import React from 'react';
import { Timeseries } from 'cognite-sdk-v3';
import { useSelectionCheckbox } from 'hooks/useSelection';
import { useResourceMode } from 'context/ResourceSelectionContext';
import { ResourceTable, ResourceTableColumns } from 'components/Common';

const ActionCell = ({ sequence }: { sequence: Timeseries }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: sequence.id, type: 'timeSeries' });
};

export const TimeseriesTable = ({
  filter,
  query,
  onTimeseriesClicked,
}: {
  filter?: any;
  query?: string;
  onTimeseriesClicked: (sequence: Timeseries) => void;
}) => {
  const { mode } = useResourceMode();

  const columns = [
    ResourceTableColumns.name,
    ResourceTableColumns.externalId,
    ResourceTableColumns.unit,
    ResourceTableColumns.lastUpdatedTime,
    ResourceTableColumns.createdTime,
    ...(mode !== 'none'
      ? [
          {
            ...ResourceTableColumns.select,
            cellRenderer: ({ rowData: sequence }: { rowData: Timeseries }) => {
              return <ActionCell sequence={sequence} />;
            },
          },
        ]
      : []),
  ];

  return (
    <ResourceTable<Timeseries>
      api="timeseries"
      filter={filter}
      query={query}
      columns={columns}
      onRowClick={onTimeseriesClicked}
    />
  );
};
