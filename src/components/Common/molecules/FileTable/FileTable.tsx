import React from 'react';
import { FileInfo as File, FileInfo } from 'cognite-sdk-v3';
import {
  TimeDisplay,
  ResourceTable,
  ResourceTableColumns,
} from 'components/Common';
import { Body } from '@cognite/cogs.js';
import { useSelectionCheckbox } from 'hooks/useSelection';
import { useResourceMode } from 'context/ResourceSelectionContext';

const ActionCell = ({ file }: { file: File }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: file.id, type: 'file' });
};

export const FileTable = ({
  query,
  filter,
  onFileClicked,
}: {
  query?: string;
  filter?: any;
  onFileClicked: (file: File) => void;
}) => {
  const { mode } = useResourceMode();

  const columns = [
    ResourceTableColumns.name,
    ResourceTableColumns.mimeType,
    {
      ...ResourceTableColumns.uploadedTime,
      cellRenderer: ({ cellData: file }: { cellData: File }) => (
        <Body level={2}>
          {file && file.uploaded && (
            <TimeDisplay value={file.uploadedTime} relative withTooltip />
          )}
        </Body>
      ),
    },
    ResourceTableColumns.lastUpdatedTime,
    ResourceTableColumns.createdTime,
    ...(mode !== 'none'
      ? [
          {
            ...ResourceTableColumns.select,
            cellRenderer: ({ rowData: file }: { rowData: File }) => {
              return <ActionCell file={file} />;
            },
          },
        ]
      : []),
  ];

  return (
    <ResourceTable<FileInfo>
      api="files"
      filter={filter}
      query={query}
      columns={columns}
      onRowClick={onFileClicked}
    />
  );
};
