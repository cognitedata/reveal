import React from 'react';
import { Typography } from 'antd';

import { SecurityCategory } from '@cognite/sdk';
import { ColumnType } from 'antd/lib/table';
import Actions from './Actions';

const { Text } = Typography;

const columns: ColumnType<SecurityCategory>[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 220,
    sorter: (a?: SecurityCategory, b?: SecurityCategory) => {
      return a && b ? a.id - b.id : -1;
    },
    render: (id: number) => (
      <Text data-testid="security-cat-id" copyable={{ text: `${id}` }}>
        {id}
      </Text>
    ),
  },
  {
    title: 'Name',
    dataIndex: 'name',
    sorter: (a?: SecurityCategory, b?: SecurityCategory) => {
      return a && b ? a.name.localeCompare(b.name) : -1;
    },
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 100,
    align: 'center',
    render: (item: SecurityCategory) => <Actions id={item.id} />,
  },
];
export default columns;
