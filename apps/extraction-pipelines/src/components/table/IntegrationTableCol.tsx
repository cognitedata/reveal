import React from 'react';
import { Cell, CellProps } from 'react-table';
import { calculateStatus } from 'utils/integrationUtils';
import { Integration } from '../../model/Integration';
import UserGroup from '../integrations/cols/UserGroup';
import Name from '../integrations/cols/Name';
import Schedule from '../integrations/cols/Schedule';
import IntegrationsTableActions from '../menu/IntegrationsTableActions';
import DataSet from '../integrations/cols/DataSet';
import DisplayEpocTime from '../integrations/cols/DisplayEpocTime';
import StatusMarker from '../integrations/cols/StatusMarker';
import StatusFilterDropdown from './StatusFilterDropdown';
import { User } from '../../model/User';

export enum TableHeadings {
  NAME = 'Name',
  STATUS = 'Status',
  LATEST_RUN = 'Latest run',
  DATA_SET = 'Destination data set',
  SCHEDULE = 'Schedule',
  LAST_SEEN = 'Last seen',
  CONTACTS = 'Contacts',
  OWNER = 'Owner',
  CREATED_BY = 'Created by',
}

export const createSearchStringForContacts = (
  owner: User,
  authors?: User[]
) => {
  return `${owner.name},${
    authors ? authors.map((aut) => aut.name).join() : ''
  }`;
};

export const createListOfContacts = (owner: User, authors?: User[]) => {
  const auth = authors ?? [];
  return [owner, ...auth];
};

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
        return <DisplayEpocTime time={row.values.latestRun.time} />;
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
      id: 'lastSeen',
      Header: TableHeadings.LAST_SEEN,
      accessor: 'lastSeen',
      Cell: ({ row }: Cell<Integration>) => {
        return <DisplayEpocTime time={row.values.lastSeen} />;
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
      id: 'contacts',
      Header: TableHeadings.CONTACTS,
      accessor: (row: Integration) => {
        return createSearchStringForContacts(row.owner, row.authors);
      },
      Cell: ({ row }: Cell<Integration>) => {
        const contacts = createListOfContacts(
          row.original.owner,
          row.original.authors
        );
        return <UserGroup users={contacts} />;
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
