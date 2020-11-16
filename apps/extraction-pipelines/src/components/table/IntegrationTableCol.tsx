import React from 'react';
import { Cell, CellProps } from 'react-table';
import { Integration } from '../../model/Integration';
import UserDetails from '../integrations/cols/UserDetails';
import Authors from '../integrations/cols/Authors';
import Name from '../integrations/cols/Name';
import LastRun from '../integrations/cols/LastRun';
import Schedule from '../integrations/cols/Schedule';
import IntegrationsTableActions from '../menu/IntegrationsTableActions';
import DataSet from '../integrations/cols/DataSet';

export enum TableHeadings {
  NAME = 'Name',
  LAST_UPDATED = 'Time of last data point',
  DATA_SET = 'Destination data sets',
  SCHEDULE = 'Schedule',
  OWNER = 'Owner',
  CREATED_BY = 'Created by',
}

export const getIntegrationTableCol = () => {
  return [
    {
      id: 'name',
      Header: TableHeadings.NAME,
      accessor: 'name',
      Cell: ({ row }: CellProps<Integration>) => {
        return <Name name={row.values.name} rowIndex={row.index} />;
      },
      sortType: 'basic',
    },
    {
      id: 'lastUpdatedTime',
      Header: TableHeadings.LAST_UPDATED,
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
      Header: TableHeadings.SCHEDULE,
      accessor: 'schedule',
      Cell: ({ row }: Cell<Integration>) => {
        return <Schedule schedule={row.values.schedule} />;
      },
      disableSortBy: true,
    },
    {
      id: 'dataSetId',
      Header: TableHeadings.DATA_SET,
      accessor: 'dataSetId',
      Cell: ({ row }: Cell<Integration>) => {
        const id = row.original.dataSet?.name ?? row.original.dataSetId;
        return (
          <DataSet dataSetId={row.original.dataSetId} dataSetName={`${id}`} />
        );
      },
      disableSortBy: true,
    },
    {
      id: 'owner',
      Header: TableHeadings.OWNER,
      accessor: (row: Integration) => {
        return row.owner.name;
      },
      Cell: ({ row }: Cell<Integration>) => {
        return <UserDetails user={row.original.owner} />;
      },
    },
    {
      id: 'authors',
      Header: TableHeadings.CREATED_BY,
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
      Header: 'Actions',
      Cell: ({ row }: Cell<Integration>) => {
        return <IntegrationsTableActions integration={row.original} />;
      },
      width: 50,
      disableSortBy: true,
    },
  ];
};
