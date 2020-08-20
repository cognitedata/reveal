import React, { useContext, useEffect, useState } from 'react';
import { Table } from 'antd';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useRouteMatch, Route } from 'react-router-dom';
import { ContentContainer } from '../../elements';
import ApiContext from '../../contexts/ApiContext';
import CreateNewConfiguration from '../../components/Molecules/CreateNewConfiguration';
import New from './New';

const StatusIcon = styled(Icon)`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.color};
  & svg {
    width: 8px;
  }
`;

const InfoIcons = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
`;

const DirectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  & svg {
    width: 12px;
    margin-bottom: -4px;
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
      return <StatusIcon type="Info" color={color} />;
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
  {
    title: '',
    dataIndex: 'actions',
    key: 'actions',
    render: (_: any, record: any) => {
      return <RowActions record={record} />;
    },
  },
];

const ActiveDirections = ({ record }: any) => {
  return (
    <DirectionContainer>
      <Icon
        type="ArrowRight"
        style={{ color: 'var(--cogs-greyscale-grey5)' }}
      />
      <Icon type="ArrowLeft" style={{ color: 'var(--cogs-midblue-3)' }} />
    </DirectionContainer>
  );
};

const RowActions = ({ record }: any) => {
  return (
    <InfoIcons>
      <ActiveDirections record={record} />
      <Icon type="TriangleRight" />
      <Icon type="Link" style={{ transform: 'rotate(-45deg)' }} />
      <Icon type="Document" style={{ color: 'red' }} />
    </InfoIcons>
  );
};

const Configurations = () => {
  const { api } = useContext(ApiContext);
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const { path } = useRouteMatch();
  const [newConfigurationName, setNewConfigurationName] = useState('');

  function onSelect(name: string) {
    setNewConfigurationName(name);
  }

  useEffect(() => {
    api!.configurations.get().then((response) => {
      setData(response);
      setColumns(fauxColumns);
    });
  }, []);

  return (
    <>
      <Route exact path="/configurations">
        <CreateNewConfiguration onSelect={onSelect} />
        <ContentContainer>
          <Table dataSource={data} columns={columns} rowKey="id" />
        </ContentContainer>
      </Route>
      <Route path={`${path}/new/:type`}>
        <New name={newConfigurationName} />
      </Route>
    </>
  );
};

export default Configurations;
