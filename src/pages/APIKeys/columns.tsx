import React from 'react';

import { Tag, Typography } from 'antd';

import { ColumnType } from 'antd/lib/table';
import { ApiKeyObject } from '@cognite/sdk';

import Actions from './Actions';

const { Text } = Typography;

interface ApiKey extends ApiKeyObject {
  serviceAccountName?: string;
}

// TODO CDFUX-1572 - figure out translation
const columns: ColumnType<ApiKey>[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 220,
    sorter: (a, b) => {
      return a.id - b.id;
    },
    render(id: number) {
      return (
        <Text data-testid="group-cat-id" copyable={{ text: `${id}` }}>
          {id}
        </Text>
      );
    },
  },
  {
    title: 'Service account',
    dataIndex: 'serviceAccountName',
    sorter: (a, b) => {
      return a.serviceAccountName && b.serviceAccountName
        ? a.serviceAccountName.localeCompare(b.serviceAccountName)
        : -1;
    },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    render(status) {
      return <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{status}</Tag>;
    },
  },
  {
    title: 'Created at',
    dataIndex: 'createdTime',
    sorter: (a, b) => {
      return a?.serviceAccountName && b?.serviceAccountName
        ? a.serviceAccountName.localeCompare(b.serviceAccountName)
        : -1;
    },
    render(createdTime: Date) {
      return createdTime.toJSON();
    },
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 100,
    align: 'center',
    render: (item: ApiKey) => <Actions id={item.id} />,
  },
];
export default columns;
