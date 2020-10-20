import React from 'react';
import { Column } from 'react-base-table';
import { Body } from '@cognite/cogs.js';
import { TimeDisplay } from 'lib/components';

export const ResourceTableColumns = {
  name: {
    key: 'name',
    title: 'Name',
    dataKey: 'name',
    width: 300,
    frozen: Column.FrozenDirection.LEFT,
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
    frozen: Column.FrozenDirection.LEFT,
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
    width: 400,
  },
  externalId: {
    key: 'externalId',
    title: 'External ID',
    dataKey: 'externalId',
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
    width: 200,
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
    title: 'MIME type',
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
    title: 'Select',
    width: 80,
    align: Column.Alignment.CENTER,
    frozen: Column.FrozenDirection.RIGHT,
  },
};
