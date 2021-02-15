import { Badge, Button, Dropdown, Menu } from '@cognite/cogs.js';
import React from 'react';
import { v3 } from '@cognite/cdf-sdk-singleton';

import AutoSizer from 'react-virtualized-auto-sizer';
import ReactBaseTable, { BaseTableProps, ColumnShape } from 'react-base-table';
import { TableWrapper } from './FileTableWrapper';

type FileTableProps = Omit<BaseTableProps<v3.FileInfo>, 'width'>;
export function FileTable(props: FileTableProps) {
  const columns: ColumnShape<v3.FileInfo>[] = [
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
      width: 200,
      // ML processing job status: Queued, In Progress, Processed <DateTime>
      cellRenderer: () => {
        return <div>–</div>;
      },
    },
    {
      key: 'annotations',
      title: 'Annotations',
      width: 0,
      flexGrow: 1,
      // ML based or custom annotations count for the file
      cellRenderer: ({ rowData: file }: { rowData: v3.FileInfo }) => {
        const hasViolations = file && file.id % 2;
        return (
          <div>
            <div>
              <Badge text="101" size={10} background="purple" /> Annotations
              detected
            </div>
            {hasViolations ? (
              /* todo: Badge.text add support of react elements. string-only for now */
              <div>
                <Badge text="!" size={10} background="red" /> Sensitive data
              </div>
            ) : null}
          </div>
        );
      },
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
          <ReactBaseTable<v3.FileInfo>
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
