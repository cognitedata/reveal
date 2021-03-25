import { Badge, Button, Dropdown, Menu } from '@cognite/cogs.js';
import React from 'react';

import AutoSizer from 'react-virtualized-auto-sizer';
import ReactBaseTable, {
  BaseTableProps,
  Column,
  ColumnShape,
} from 'react-base-table';
import { TimeDisplay } from '@cognite/data-exploration';
import { JobStatus } from 'src/api/types';
import { TableWrapper } from './FileTableWrapper';

export type MenuActions = {
  annotationsAvailable: boolean;
  onAnnotationEditClick?: () => void;
  showMetadataPreview: (fileId: number) => void;
};

export type TableDataItem = {
  id: number;
  mimeType: string;
  name: string;
  status: JobStatus | '';
  statusTime: number;
  annotationsCount: number;
  menu: MenuActions;
};

type CellRenderer = {
  rowData: TableDataItem;
};

type FileTableProps = Omit<BaseTableProps<TableDataItem>, 'width'>;

function AnnotationCell({ rowData }: CellRenderer) {
  const getMessage = () => {
    switch (rowData.status) {
      case 'Queued': {
        return 'ML queued';
      }
      case 'Running': {
        return 'Detecting...';
      }
      case 'Completed': {
        return rowData.annotationsCount
          ? 'Annotations detected'
          : 'No annotations detected';
      }
      case 'Failed': {
        return 'Error occurred';
      }
      default: {
        return 'Run ML to detect';
      }
    }
  };

  const badge = rowData.annotationsCount
    ? String(rowData.annotationsCount)
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
        if (rowData.status === 'Completed') {
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
      dataKey: 'menu',
      width: 100,
      cellRenderer: ({ rowData }: CellRenderer) => {
        const { menu } = rowData;
        const handleAnnotationEdit = () => {
          if (menu?.onAnnotationEditClick) {
            menu.onAnnotationEditClick();
          }
        };

        const handleMetadataEdit = () => {
          if (menu?.showMetadataPreview) {
            menu.showMetadataPreview(rowData.id);
          }
        };
        // todo: bind actions
        const MenuContent = (
          <Menu
            style={{
              color: 'black' /* typpy styles make color to be white here ... */,
            }}
          >
            <Menu.Item onClick={handleMetadataEdit}>Edit metadata</Menu.Item>

            <Menu.Item disabled>Attach events file</Menu.Item>

            <Menu.Item onClick={handleAnnotationEdit}>
              Edit annotations
            </Menu.Item>

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
      <AutoSizer style={{ width: 'auto', height: 'auto' }}>
        {({ width }) => (
          <ReactBaseTable<TableDataItem>
            columns={columns}
            maxHeight={Infinity}
            width={width}
            {...props}
          />
        )}
      </AutoSizer>
    </TableWrapper>
  );
}
