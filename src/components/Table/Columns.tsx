import React from 'react';
import { Column } from 'react-base-table';
import { Body, Flex, Tag, Tooltip } from '@cognite/cogs.js';
import { TimeDisplay } from 'components';
import { RelationshipCell } from 'containers/Relationships/RelationshipCell';
import { ResourceItem } from 'types';
import styled from 'styled-components';
import { uniqueId } from 'lodash';

export const ResourceTableColumns = {
  name: {
    key: 'name',
    title: 'Name',
    dataKey: 'name',
    width: 200,
  },
  relation: {
    key: 'relation',
    title: 'Relationship Description(Source/Target)',
    dataKey: 'relation',
    width: 200,
  },

  relationshipLabels: {
    key: 'relationshipLabels',
    title: 'Relationship Labels',
    dataKey: 'relationshipLabels',
    width: 250,
    resizable: true,
    cellRenderer: ({ rowData }: { rowData: any }) => (
      <Flex gap={2} wrap="wrap">
        {rowData.relationshipLabels?.map((label: string) => (
          <Tooltip content={label} key={uniqueId()}>
            <StyledTag style={{ display: 'block' }}>{label}</StyledTag>
          </Tooltip>
        ))}
      </Flex>
    ),
  },
  externalId: {
    key: 'externalId',
    title: 'External ID',
    dataKey: 'externalId',
    width: 200,
  },
  root: {
    key: 'root',
    title: 'Root asset',
    width: 200,
  },
  type: {
    key: 'type',
    title: 'Type',
    dataKey: 'type',
    width: 200,
  },
  subtype: {
    key: 'subtype',
    title: 'Subtype',
    dataKey: 'subtype',
    width: 200,
  },
  description: {
    key: 'description',
    title: 'Description',
    dataKey: 'description',
    width: 200,
  },
  lastUpdatedTime: {
    key: 'lastUpdatedTime',
    title: 'Last updated',
    dataKey: 'lastUpdatedTime',
    width: 200,
    cellRenderer: ({ cellData: lastUpdatedTime }: { cellData?: number }) => (
      <Body level={2}>
        <TimeDisplay value={lastUpdatedTime} relative withTooltip />
      </Body>
    ),
  },
  unit: {
    key: 'unit',
    title: 'Unit',
    dataKey: 'unit',
    width: 100,
  },
  columns: {
    key: 'columns',
    title: '# of Columns',
    dataKey: 'columns',
    width: 200,
    cellRenderer: ({ cellData: columns }: { cellData: any[] }) => (
      <Body level={2}>{columns.length}</Body>
    ),
  },
  createdTime: {
    key: 'createdTime',
    title: 'Created',
    dataKey: 'createdTime',
    width: 200,
    cellRenderer: ({ cellData: createdTime }: { cellData?: number }) => (
      <Body level={2}>
        <TimeDisplay value={createdTime} relative withTooltip />
      </Body>
    ),
  },
  mimeType: {
    key: 'mimeType',
    title: 'Type',
    dataKey: 'mimeType',
    width: 200,
  },
  uploadedTime: {
    key: 'uploadedTime',
    title: 'Uploaded',
    width: 200,
  },
  select: {
    key: 'action',
    title: '',
    width: 40,
    align: Column.Alignment.CENTER,
    frozen: Column.FrozenDirection.LEFT,
  },
  relationships: {
    key: 'relationships',
    title: 'Relationships',
    dataKey: 'externalId',
    width: 300,
    cellRenderer: ({ rowData: resource }: { rowData: ResourceItem }) => (
      <RelationshipCell resourceExternalId={resource.externalId} />
    ),
  },
};

const StyledTag = styled(Tag)`
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
