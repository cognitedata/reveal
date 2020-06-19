import React from 'react';
import { Button, Icon } from '@cognite/cogs.js';
import { ContentContainer } from './elements';
import Table from '../../components/Organisms/Table';
import { colors } from '../../global-styles';

const dataSource = [
  {
    key: '1',
    status: 'Active',
    name: 'CWP_session_1',
    revision: '17/12/2009',
    author: 'Erland Glad Solstrand',
    repositoryProject: 'Valhall_2212/Proj_29991',
    options: {
      icon: <Icon type="Circle" style={{ color: colors.success }} />,
    },
    actions: [
      <Button
        key="edit"
        size="small"
        onClick={() => console.log('Edit CWP_session_1')}
      >
        Edit
      </Button>,
    ],
  },
  {
    key: '2',
    status: 'Inactive',
    name: 'CWP_session_2',
    revision: '17/12/2010',
    author: 'Adam Tombleson',
    repositoryProject: 'Ivar_Aasen_foobar/Proj_29991',
    options: {
      icon: <Icon type="Circle" style={{ color: colors.grey5 }} />,
      expandable: true,
    },
    actions: [
      <Button
        key="edit"
        size="small"
        onClick={() => console.log('Edit CWP_session_2')}
      >
        Edit
      </Button>,
    ],
  },
  {
    key: '3',
    status: 'Inactive',
    name: 'CWP_session_3',
    revision: '23/01/2020',
    author: 'Rui Martins',
    repositoryProject: 'Alvheim/Proj_29991',
    options: {
      icon: <Icon type="Circle" style={{ color: colors.grey5 }} />,
    },
    actions: [
      <Button
        key="edit"
        size="small"
        onClick={() => console.log('Edit CWP_session_3')}
      >
        Edit
      </Button>,
    ],
  },
];

const columns = [
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '',
    dataIndex: '',
    key: 'expander',
    render: () => <Icon type="Down" />,
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Revision',
    dataIndex: 'revision',
    key: 'revision',
  },
  {
    title: 'Author',
    dataIndex: 'author',
    key: 'author',
  },
  {
    title: 'Repository/Project',
    dataIndex: 'repositoryProject',
    key: 'repositoryProject',
  },
];

const Configurations = () => {
  return (
    <ContentContainer>
      <Table dataSource={dataSource} columns={columns} />
    </ContentContainer>
  );
};

export default Configurations;
