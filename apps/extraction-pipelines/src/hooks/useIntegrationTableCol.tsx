import React, { useMemo } from 'react';
import { Integration } from '../model/Integration';
import OwnedBy from '../components/integrations/cols/OwnedBy';
import Authors from '../components/integrations/cols/Authors';
import Name from '../components/integrations/cols/Name';
import LastRun from '../components/integrations/cols/LastRun';
import Schedule from '../components/integrations/cols/Schedule';

export const useIntegrationTableCol = () => {
  return useMemo(
    () => [
      {
        Header: 'Name',
        accessor: (integration: Integration) => (
          <Name name={integration.name} />
        ),
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
    ],
    []
  );
};
