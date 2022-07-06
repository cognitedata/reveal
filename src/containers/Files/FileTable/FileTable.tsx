import React from 'react';
import { FileInfo as File } from '@cognite/sdk';

import { TimeDisplay, TableProps, Table } from 'components';
import { Body, Tooltip } from '@cognite/cogs.js';
import { RelationshipLabels } from 'types';
import { getColumnsWithRelationshipLabels, mapFileType } from 'utils';

type FileWithRelationshipLabels = RelationshipLabels & File;
export const FileTable = (props: TableProps<FileWithRelationshipLabels>) => {
  const { relatedResourceType } = props;

  const columns = [
    Table.Columns.name,
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
  ];

  const updatedColumns = getColumnsWithRelationshipLabels(
    columns,
    relatedResourceType === 'relationship'
  );

  return (
    <Table<FileWithRelationshipLabels> columns={updatedColumns} {...props} />
  );
};
