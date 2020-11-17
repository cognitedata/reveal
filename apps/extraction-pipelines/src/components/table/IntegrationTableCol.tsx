import React from 'react';
import { Cell, CellProps } from 'react-table';
import { calculateStatus } from 'utils/integrationUtils';
import { Integration } from '../../model/Integration';
import UserDetails from '../integrations/cols/UserDetails';
import Authors from '../integrations/cols/Authors';
import Name from '../integrations/cols/Name';
import LatestRun from '../integrations/cols/LatestRun';
import Schedule from '../integrations/cols/Schedule';
import IntegrationsTableActions from '../menu/IntegrationsTableActions';
import DataSet from '../integrations/cols/DataSet';
import StatusMarker from '../integrations/cols/StatusMarker';
import StatusFilterDropdown from './StatusFilterDropdown';

export enum TableHeadings {
  NAME = 'Name',
  STATUS = 'Status',
  LATEST_RUN = 'Latest run',
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
      disableFilters: true,
    },
    {
      id: 'status',
      Header: TableHeadings.STATUS,
      accessor: ({ lastSuccess, lastFailure }: Integration) => {
        const status = calculateStatus({ lastSuccess, lastFailure });
        return status.status;
      },
      Cell: ({ row }: CellProps<Integration>) => {
        return <StatusMarker status={row.values.status} />;
      },
      disableSortBy: true,
      Filter: StatusFilterDropdown,
      filter: 'includes',
      disableFilters: false,
    },
    {
      id: 'latestRun',
      Header: TableHeadings.LATEST_RUN,
      accessor: ({ lastSuccess, lastFailure }: Integration) => {
        const status = calculateStatus({ lastSuccess, lastFailure });
        return status;
      },
      Cell: ({ row }: Cell<Integration>) => {
        return <LatestRun latestRunTime={row.values.latestRun.time} />;
      },
      disableSortBy: true,
      disableFilters: true,
    },
    {
      id: 'schedule',
      Header: TableHeadings.SCHEDULE,
      accessor: 'schedule',
      Cell: ({ row }: Cell<Integration>) => {
        return <Schedule schedule={row.values.schedule} />;
      },
      disableSortBy: true,
      disableFilters: true,
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
      disableFilters: true,
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
      disableFilters: true,
    },
    {
      id: 'authors',
      Header: TableHeadings.CREATED_BY,
      accessor: (row: Integration) => {
        return row.authors.map((aut) => aut.name).join();
      },
      Cell: ({ row }: Cell<Integration>) => {
        return <Authors authors={row.original.authors} />;
      },
      disableSortBy: true,
      disableFilters: true,
    },
    {
      id: 'options',
      Header: 'Actions',
      Cell: ({ row }: Cell<Integration>) => {
        return <IntegrationsTableActions integration={row.original} />;
      },
      width: 50,
      disableSortBy: true,
      disableFilters: true,
    },
  ];
};
