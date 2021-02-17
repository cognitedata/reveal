import { Badge, Button, Dropdown, Menu } from '@cognite/cogs.js';
import React from 'react';

import AutoSizer from 'react-virtualized-auto-sizer';
import ReactBaseTable, {
  BaseTableProps,
  Column,
  ColumnShape,
} from 'react-base-table';
import { Annotation, JobStatus } from 'src/api/annotationJob';
import { TimeDisplay } from '@cognite/data-exploration';
import { TableWrapper } from './FileTableWrapper';

export type TableDataItem = {
  id: number;
  mimeType: string;
  name: string;
  status: JobStatus | '';
  statusTime: number;
  annotations: Array<Annotation>;
};

type CellRenderer = { rowData: TableDataItem };

type FileTableProps = Omit<BaseTableProps<TableDataItem>, 'width'>;

function AnnotationCell({ rowData }: CellRenderer) {
  const getMessage = () => {
    switch (rowData.status) {
      case 'QUEUED': {
        return 'ML queued';
      }
      case 'RUNNING': {
        return 'Detecting...';
      }
      case 'COMPLETED': {
        return rowData.annotations.length
          ? 'Annotations detected'
          : 'No annotations detected';
      }
      case 'FAILED': {
        return 'Error occurred';
      }
      default: {
        return 'Run ML to detect';
      }
    }
  };

  const badge = rowData.annotations.length
    ? String(rowData.annotations.length)
    : '–';

  return (
    <div>
      <Badge text={badge} size={13} background="purple" />
      {` ${getMessage()}`}
    </div>
  );
}

export function FileTable(props: FileTableProps) {
  const columns: ColumnShape<TableDataItem>[] = [
    {
      key: 'name',
      title: 'Name',
      dataKey: 'name',
      width: 0,
      flexGrow: 1, // since table is fixed, at least one col must grow
    },
    {
      key: 'mimeType',
      title: 'Mime Type',
      dataKey: 'mimeType',
      width: 100,
    },
    {
      key: 'status',
      title: 'Status',
      width: 250,
      align: Column.Alignment.CENTER,
      // ML processing job status: Queued, In Progress, Processed <DateTime>
      cellRenderer: ({ rowData }: CellRenderer) => {
        if (rowData.status === 'COMPLETED') {
          return (
            <div>
              Processed{' '}
              <TimeDisplay value={rowData.statusTime} relative withTooltip />
            </div>
          );
        }
        return (
          <div style={{ textTransform: 'capitalize' }}>
            {rowData.status.toLowerCase() || '–'}
          </div>
        );
      },
    },
    {
      key: 'annotations',
      title: 'Annotations',
      width: 0,
      flexGrow: 1,
      // ML based or custom annotations count for the file
      cellRenderer: AnnotationCell,
    },
    {
      key: 'action',
      title: 'Action',
      width: 100,
      cellRenderer: () => {
        // todo: bind actions
        const MenuContent = (
          <Menu
            style={{
              color: 'black' /* typpy styles make color to be white here ... */,
            }}
          >
            <Menu.Item>Edit metadata</Menu.Item>

            <Menu.Item disabled>Attach events file</Menu.Item>

            <Menu.Item disabled>Edit annotations</Menu.Item>

            <Menu.Item>Delete</Menu.Item>
          </Menu>
        );

        return (
          <Dropdown content={MenuContent}>
            <Button type="secondary" variant="ghost">
              •••
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <TableWrapper>
      <AutoSizer>
        {({ width, height }) => (
          <ReactBaseTable<TableDataItem>
            columns={columns}
            height={height}
            width={width}
            {...props}
          />
        )}
      </AutoSizer>
    </TableWrapper>
  );
}
