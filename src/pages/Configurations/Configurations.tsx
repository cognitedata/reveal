import React, { useContext, useEffect, useState } from 'react';
import { Table } from 'antd';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { ContentContainer } from '../../elements';
import ApiContext from '../../contexts/ApiContext';

const StatusIcon = styled(Icon)`
  color: ${(props) => props.color};
  & svg {
    width: 8px;
  }
`;

const fauxColumns = [
  {
    title: '',
    dataIndex: 'statusIcon',
    key: 'statusIcon',
    render: (_: any, record: any) => {
      let color = 'var(--cogs-success)';
      switch (record.status) {
        case 'Active':
          color = 'var(--cogs-success)';
          break;
        case 'Inactive':
          color = 'var(--cogs-greyscale-grey5)';
      }
      return <StatusIcon type="Circle" color={color} />;
    },
  },
  {
    title: 'status',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'revision',
    dataIndex: 'revision',
    key: 'revision',
  },
  {
    title: 'author',
    dataIndex: 'author',
    key: 'author',
  },
  {
    title: 'repository',
    dataIndex: 'repository',
    key: 'repository',
  },
  {
    title: 'project',
    dataIndex: 'project',
    key: 'project',
  },
];

const Configurations = () => {
  const { api } = useContext(ApiContext);
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>(fauxColumns);

  useEffect(() => {
    api!.configurations.get().then((response) => {
      setData(response);
    });
  });

  return (
    <ContentContainer>
      <Table dataSource={data} columns={columns} rowKey="id" />
    </ContentContainer>
  );
};

export default Configurations;
