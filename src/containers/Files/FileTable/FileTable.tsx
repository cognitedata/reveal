import React from 'react';

import { FileInfo } from '@cognite/sdk';
import { TimeDisplay, TableProps, Table } from 'components';
import { Body, Tooltip } from '@cognite/cogs.js';
import { RelationshipLabels } from 'types';
import { getColumnsWithRelationshipLabels, mapFileType } from 'utils';
import { FileNamePreview } from './FileNamePreview';

type FileWithRelationshipLabels = RelationshipLabels & FileInfo;
export const FileTable = (props: TableProps<FileWithRelationshipLabels>) => {
  const { relatedResourceType, query } = props;

  const columns = [
    {
      ...Table.Columns.name,
      cellRenderer: ({
        cellData: fileName,
        rowData: file,
      }: {
        cellData: string;
        rowData: FileInfo;
      }) => {
        const fileNamePreviewProps = { fileName, file, query };
        return <FileNamePreview {...fileNamePreviewProps} />;
      },
    },
    {
      ...Table.Columns.mimeType,
      cellRenderer: ({ cellData: mimeValue }: { cellData: string }) => (
        <Body level={2}>
          <Tooltip interactive content={mimeValue}>
            <>{mapFileType(mimeValue || '')}</>
          </Tooltip>
        </Body>
      ),
    },
    {
      ...Table.Columns.uploadedTime,
      cellRenderer: ({ cellData: file }: { cellData: FileInfo }) => (
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
  ];

  const updatedColumns = getColumnsWithRelationshipLabels(
    columns,
    relatedResourceType === 'relationship'
  );

  return (
    <Table<FileWithRelationshipLabels> columns={updatedColumns} {...props} />
  );
};
