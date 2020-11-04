import React from 'react';
import { Cell, CellProps } from 'react-table';
import { Integration } from '../../model/Integration';
import OwnedBy from '../integrations/cols/OwnedBy';
import Authors from '../integrations/cols/Authors';
import Name from '../integrations/cols/Name';
import LastRun from '../integrations/cols/LastRun';
import Schedule from '../integrations/cols/Schedule';
import IntegrationsTableOptions from '../menu/IntegrationsTableOptions';

export const getIntegrationTableCol = () => {
  return [
    {
      id: 'name',
      Header: 'Name',
      accessor: 'name',
      Cell: ({ row }: CellProps<Integration>) => {
        return <Name name={row.values.name} rowIndex={row.index} />;
      },
      sortType: 'basic',
    },
    {
      id: 'lastUpdatedTime',
      Header: 'Last run',
      accessor: 'lastUpdatedTime',
      Cell: ({ row }: Cell<Integration>) => {
        return (
          <LastRun
            lastUpdatedTime={row.values.lastUpdatedTime}
            numberOfDays={1}
            unitOfTime="days"
          />
        );
      },
      disableSortBy: true,
    },
    {
      id: 'schedule',
      Header: 'Schedule',
      accessor: 'schedule',
      Cell: ({ row }: Cell<Integration>) => {
        return <Schedule schedule={row.values.schedule} />;
      },
      disableSortBy: true,
    },
    {
      id: 'owner',
      Header: 'Owner',
      accessor: (row: Integration) => {
        return row.owner.name;
      },
      Cell: ({ row }: Cell<Integration>) => {
        return <OwnedBy owner={row.original.owner} />;
      },
    },
    {
      id: 'authors',
      Header: 'Created by',
      accessor: (row: Integration) => {
        return row.authors.map((aut) => aut.name).join();
      },
      disableSortBy: true,
      Cell: ({ row }: Cell<Integration>) => {
        return <Authors authors={row.original.authors} />;
      },
    },
    {
      id: 'options',
      accessor: (integration: Integration) => (
        <IntegrationsTableOptions integration={integration} />
      ),
      width: 50,
      disableSortBy: true,
    },
  ];
};
