import React from 'react';
import Name from './Name';
import LastRun from './LastRun';
import Schedule from './Schedule';
import { User } from '../../../model/User';
import OwnedBy from './OwnedBy';
import Authors from './Authors';
import { Integration } from '../../../model/Integration';

export const integrationColumns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (name: string) => {
      return <Name name={name} />;
    },
    sorter: (a: Integration, b: Integration) => {
      return a.name.localeCompare(b.name);
    },
  },
  {
    title: 'Last Run',
    dataIndex: 'lastUpdatedTime',
    key: 'lastUpdatedTime',
    render: (lastUpdatedTime: number) => {
      return (
        <LastRun
          lastUpdatedTime={lastUpdatedTime}
          numberOfDays={1}
          unitOfTime="days"
        />
      );
    },
  },
  {
    title: 'Schedule',
    dataIndex: 'schedule',
    key: 'schedule',
    render: (schedule: string) => {
      return <Schedule schedule={schedule} />;
    },
  },
  {
    title: 'Owned by',
    dataIndex: 'owner',
    key: 'owner',
    render: (owner: User) => {
      return <OwnedBy owner={owner} />;
    },
    sorter: (a: Integration, b: Integration) => {
      return a.owner.name.localeCompare(b.owner.name);
    },
  },
  {
    title: 'Created by',
    dataIndex: 'authors',
    key: 'authors',
    render: (authors: User[]) => {
      return <Authors authors={authors} />;
    },
  },
];
