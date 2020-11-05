import React from 'react';
import { FileInfo as File, FileInfo } from '@cognite/sdk';
import { TimeDisplay, TableProps, Table } from 'lib/components';
import { Body } from '@cognite/cogs.js';
import { useSelectionCheckbox } from 'lib/hooks/useSelection';
import { useResourceMode } from 'lib/context';

const ActionCell = ({ file }: { file: File }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: file.id, type: 'file' });
};

export const FileTable = ({
  items,
  onItemClicked,
  ...props
}: {
  items: File[];
  onItemClicked: (file: File) => void;
} & TableProps<File>) => {
  const { mode } = useResourceMode();

  const columns = [
    Table.Columns.name,
    Table.Columns.mimeType,
    {
      ...Table.Columns.uploadedTime,
      cellRenderer: ({ cellData: file }: { cellData: File }) => (
        <Body level={2}>
          {file && file.uploaded && (
            <TimeDisplay value={file.uploadedTime} relative withTooltip />
          )}
        </Body>
      ),
    },
    Table.Columns.relationships,
    Table.Columns.lastUpdatedTime,
    Table.Columns.createdTime,
    ...(mode !== 'none'
      ? [
          {
            ...Table.Columns.select,
            cellRenderer: ({ rowData: file }: { rowData: File }) => {
              return <ActionCell file={file} />;
            },
          },
        ]
      : []),
  ];

  return (
    <Table<FileInfo>
      data={items}
      columns={columns}
      onRowClick={onItemClicked}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
};
