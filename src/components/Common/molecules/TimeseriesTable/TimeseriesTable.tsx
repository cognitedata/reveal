import React, { useState } from 'react';
import { Timeseries } from 'cognite-sdk-v3';
import Table, { Column } from 'react-base-table';
import { Body } from '@cognite/cogs.js';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useSelectionCheckbox } from 'hooks/useSelection';
import {
  useResourceMode,
  useResourcesState,
} from 'context/ResourceSelectionContext';
import Highlighter from 'react-highlight-words';
import { TableWrapper, TimeDisplay } from 'components/Common';

const headerRenderer = ({
  column: { title },
}: {
  column: { title: string };
}) => (
  <Body level={3} strong>
    {title}
  </Body>
);

const ActionCell = ({ sequence }: { sequence: Timeseries }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: sequence.id, type: 'timeSeries' });
};

export const TimeseriesTable = ({
  timeseries,
  query,
  onTimeseriesClicked,
}: {
  timeseries: Timeseries[];
  query?: string;
  onTimeseriesClicked: (sequence: Timeseries) => void;
}) => {
  const [previewId, setPreviewId] = useState<number | undefined>(undefined);
  const { mode } = useResourceMode();
  const { resourcesState } = useResourcesState();

  const currentItems = resourcesState.filter(el => el.state === 'active');

  const onTimeseriesSelected = (sequence: Timeseries) => {
    onTimeseriesClicked(sequence);
    setPreviewId(sequence.id);
  };

  return (
    <TableWrapper>
      <AutoSizer>
        {({ width, height }) => (
          <Table
            rowEventHandlers={{
              onClick: ({ rowData: sequence, event }) => {
                onTimeseriesSelected(sequence);
                return event;
              },
            }}
            rowClassName={({ rowData }) => {
              const extraClasses: string[] = [];
              if (previewId === rowData.id) {
                extraClasses.push('previewing');
              }
              if (currentItems.some(el => el.id === rowData.id)) {
                extraClasses.push('active');
              }
              return `row clickable ${extraClasses.join(' ')}`;
            }}
            width={width}
            height={height}
            columns={[
              {
                key: 'name',
                title: 'Name',
                dataKey: 'name',
                headerRenderer,
                width: 300,
                resizable: true,
                cellProps: { query },
                cellRenderer: ({ cellData: name }: { cellData: string }) => (
                  <Body level={2} strong>
                    <Highlighter
                      searchWords={(query || '').split(' ')}
                      textToHighlight={name}
                    />
                  </Body>
                ),
                frozen: Column.FrozenDirection.LEFT,
              },
              {
                key: 'externalId',
                title: 'External ID',
                dataKey: 'externalId',
                width: 200,
                headerRenderer,
                cellRenderer: ({
                  cellData: externalId,
                }: {
                  cellData?: string;
                }) => <Body level={2}>{externalId}</Body>,
                resizable: true,
              },
              {
                key: 'unit',
                title: 'Unit',
                dataKey: 'unit',
                width: 200,
                headerRenderer,
                cellRenderer: ({ cellData: unit }: { cellData?: string }) => (
                  <Body level={2}>{unit}</Body>
                ),
                resizable: true,
              },
              {
                key: 'lastUpdatedTime',
                title: 'Last updated',
                dataKey: 'lastUpdatedTime',
                width: 200,
                headerRenderer,
                cellRenderer: ({
                  cellData: lastUpdatedTime,
                }: {
                  cellData?: number;
                }) => (
                  <Body level={2}>
                    <TimeDisplay value={lastUpdatedTime} relative withTooltip />
                  </Body>
                ),
                resizable: true,
              },
              {
                key: 'createdTime',
                title: 'Created',
                dataKey: 'createdTime',
                width: 200,
                headerRenderer,
                cellRenderer: ({
                  cellData: createdTime,
                }: {
                  cellData?: number;
                }) => (
                  <Body level={2}>
                    <TimeDisplay value={createdTime} relative withTooltip />
                  </Body>
                ),
                resizable: true,
              },
              ...(mode !== 'none'
                ? [
                    {
                      key: 'action',
                      title: 'Select',
                      width: 80,
                      resizable: true,
                      align: Column.Alignment.CENTER,
                      frozen: Column.FrozenDirection.RIGHT,
                      headerRenderer,
                      cellRenderer: ({
                        rowData: sequence,
                      }: {
                        rowData: Timeseries;
                      }) => {
                        return <ActionCell sequence={sequence} />;
                      },
                    },
                  ]
                : []),
            ]}
            fixed
            data={timeseries}
          />
        )}
      </AutoSizer>
    </TableWrapper>
  );
};
