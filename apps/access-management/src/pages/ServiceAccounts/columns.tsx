import React from 'react';

import { Typography } from 'antd';

import { ColumnType } from 'antd/lib/table';
import { ServiceAccount } from '@cognite/sdk';

import EditGroups from './EditGroups';
import Actions from './Actions';

const { Text } = Typography;

const columns: ColumnType<ServiceAccount>[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 230,
    sorter: (a?: ServiceAccount, b?: ServiceAccount) => {
      return a && b ? a.id - b.id : -1;
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
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a?: ServiceAccount, b?: ServiceAccount) => {
      return a && b ? a.name.localeCompare(b.name) : -1;
    },
  },
  {
    title: 'Groups',
    key: 'groups',
    render(account: ServiceAccount) {
      return <EditGroups account={account} />;
    },
  },

  {
    title: 'Actions',
    key: 'actions',
    width: 100,
    align: 'center',
    render: (item: ServiceAccount) => <Actions id={item.id} name={item.name} />,
  },
];
export default columns;
