/* eslint-disable no-console */
import React from 'react';
import { Button, Icon } from '@cognite/cogs.js';
import Table from 'components/Organisms/Table';
import { Trans } from 'react-i18next';
import { ContentContainer } from './elements';
import ExpandableInput from '../../components/Molecules/ExpandableInput';

const dataSource = [
  {
    key: '1',
    status: 'Active',
    name: 'CWP_session_1',
    revision: '17/12/2009',
    author: 'Erland Glad Solstrand',
    repositoryProject: 'Valhall_2212/Proj_29991',
    options: {
      icon: <Icon type="Circle" style={{ color: 'var(--cogs-success)' }} />,
    },
    actions: [
      <Button
        key="edit"
        size="small"
        onClick={() => console.log('Edit CWP_session_1')}
      >
        <Trans i18nKey="Global:BtnEdit" />
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
      icon: (
        <Icon type="Circle" style={{ color: 'var(--cogs-greyscale-grey5)' }} />
      ),
      expandable: true,
    },
    actions: [
      <Button
        key="edit"
        size="small"
        onClick={() => console.log('Edit CWP_session_2')}
      >
        <Trans i18nKey="Global:BtnEdit" />
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
      icon: (
        <Icon type="Circle" style={{ color: 'var(--cogs-greyscale-grey5)' }} />
      ),
    },
    actions: [
      <Button
        key="edit"
        size="small"
        onClick={() => console.log('Edit CWP_session_3')}
      >
        <Trans i18nKey="Global:BtnEdit" />
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
    <>
      <ExpandableInput />
      <ContentContainer>
        <Table dataSource={dataSource} columns={columns} />
      </ContentContainer>
    </>
  );
};

export default Configurations;
