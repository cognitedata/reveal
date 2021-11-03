import React from 'react';
import {
  Body,
  Button,
  Label,
  Table,
  TableProps,
  Tooltip,
} from '@cognite/cogs.js';
import { Tag } from 'components';
import { Navigation } from 'hooks/useNavigation';

export const curateColumns = (navigate: Navigation) => {
  return [
    {
      Header: 'Label',
      accessor: 'id',
      Filter: Table.InputFilter(),
      filter: 'fuzzyText',
      filterIcon: 'Search',
      disableSortBy: true,
      Cell: ({ value }: { value?: string }) => (
        <Label size="medium" variant="unknown">
          {value || 'Unknown'}
        </Label>
      ),
    },
    {
      Header: 'Description',
      accessor: 'description',
      Cell: ({ value }: { value?: string }) => (
        <Body level={2}>{value || '-'}</Body>
      ),
    },
    {
      Header: 'Files in label',
      accessor: 'count',
      Cell: ({ value }: { value: number }) => {
        return <Tag>{value}</Tag>;
      },
    },
    {
      Header: '',
      accessor: 'settings',
      Cell: ({
        row: {
          original: { label },
        },
      }: any) => {
        return (
          <Tooltip content="Manage files in label">
            <Button
              size="small"
              icon="Edit"
              type="tertiary"
              aria-label="Add files"
              onClick={() => navigate.toDocument(label)}
            />
          </Tooltip>
        );
      },
    },
  ] as TableProps<any>['columns'];
};
