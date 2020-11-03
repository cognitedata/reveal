import React from 'react';
import { Column } from 'react-table';
import { Integration } from '../../model/Integration';
import OwnedBy from '../integrations/cols/OwnedBy';
import Authors from '../integrations/cols/Authors';
import Name from '../integrations/cols/Name';
import LastRun from '../integrations/cols/LastRun';
import Schedule from '../integrations/cols/Schedule';

export const getIntegrationTableCol = (): ReadonlyArray<
  Column<Integration>
> => {
  return [
    {
      Header: 'Name',
      accessor: (integration: Integration, rowIndex: number) => {
        return <Name name={integration.name} rowIndex={rowIndex} />;
      },
      sortType: 'basic',
    },
    {
      Header: 'Last run',
      accessor: (integration: Integration) => (
        <LastRun
          lastUpdatedTime={integration.lastUpdatedTime}
          numberOfDays={1}
          unitOfTime="days"
        />
      ),
      disableSortBy: true,
    },
    {
      Header: 'Schedule',
      accessor: (integration: Integration) => (
        <Schedule schedule={integration.schedule} />
      ),
      disableSortBy: true,
    },
    {
      Header: 'Owner',
      accessor: (integration: Integration) => {
        return <OwnedBy owner={integration.owner} />;
      },
    },
    {
      Header: 'Created by',
      accessor: (integration: Integration) => (
        <Authors authors={integration.authors} />
      ),
      disableSortBy: true,
    },
  ];
};
