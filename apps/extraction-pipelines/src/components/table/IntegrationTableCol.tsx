import React from 'react';
import { Cell, CellProps, Column, HeaderProps } from 'react-table';
import {
  addIfExist,
  calculateLatest,
  calculateStatus,
} from 'utils/integrationUtils';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import { Integration } from 'model/Integration';
import Name from 'components/integrations/cols/Name';
import Schedule from 'components/integrations/cols/Schedule';
import { DataSet } from 'components/integrations/cols/DataSet';
import StatusMarker from 'components/integrations/cols/StatusMarker';
import StatusFilterTableDropdown from 'components/table/StatusFilterTableDropdown';
import { User } from 'model/User';
import RelativeTimeWithTooltip from 'components/integrations/cols/RelativeTimeWithTooltip';
import SorterIndicator from 'components/table/SorterIndicator';
import MessageIcon from 'components/message/MessageIcon';
import { RunStatusUI } from 'model/Status';
import { DataSetModel } from 'model/DataSetModel';

export enum TableHeadings {
  NAME = 'Name',
  LAST_RUN_STATUS = 'Last run status',
  LATEST_RUN_TIME = 'Last run time',
  DATA_SET = 'Data set',
  SCHEDULE = 'Schedule',
  LAST_SEEN = 'Last connected',
  CONTACTS = 'Contacts',
  OWNER = 'Owner',
}

const StyledStatusButton = styled((props) => (
  <Button {...props}>{props.children}</Button>
))`
  &.status-btn {
    background-color: transparent;
    border: none !important;
    font: inherit;
    padding: 0;
    white-space: nowrap;
    :focus {
      background-color: transparent;
    }
    :hover {
      background-color: transparent;
      box-shadow: none;
    }
    span {
      cursor: pointer !important;
    }
  }
`;

interface OpenFailMessageFunc {
  (row: Integration): void;
}

export const createSearchStringForContacts = (contacts?: User[]) => {
  return `${contacts?.length ? contacts.map((aut) => aut.name).join() : ''}`;
};
export const createSearchStringForDataSet = (
  dataSetId: number,
  dataSet?: DataSetModel
) => {
  return `${dataSetId} ${dataSet ? dataSet.name : ''}`;
};

export const getIntegrationTableCol = (
  openFailMessage: OpenFailMessageFunc
): Column<Integration>[] => {
  return [
    {
      id: 'name',
      Header: ({ column }: HeaderProps<Integration>) => {
        return <SorterIndicator name={TableHeadings.NAME} column={column} />;
      },
      accessor: 'name',
      Cell: ({ row }: CellProps<Integration>) => {
        return (
          <Name
            name={row.values.name}
            integrationId={`${row.original.id}`}
            selected={row.isSelected}
          />
        );
      },
      sortType: 'basic',
      disableFilters: true,
    },
    {
      id: 'externalId',
      accessor: 'externalId',
      Cell: <></>,
      disableSortBy: true,
      disableFilters: true,
    },
    {
      id: 'status',
      Header: TableHeadings.LAST_RUN_STATUS,
      accessor: ({ lastSuccess, lastFailure }: Integration) => {
        const status = calculateStatus({ lastSuccess, lastFailure });
        return status.status;
      },
      Cell: ({ row }: CellProps<Integration>) => {
        return row.values.status === RunStatusUI.FAILURE ? (
          <StyledStatusButton
            className="status-btn"
            onClick={() => {
              openFailMessage(row.original);
            }}
          >
            <StatusMarker id="status-marker" status={row.values.status} />
            <MessageIcon status={row.values.status} />
          </StyledStatusButton>
        ) : (
          <StatusMarker id="status-marker" status={row.values.status} />
        );
      },
      disableSortBy: true,
      Filter: StatusFilterTableDropdown,
      filter: 'includes',
      disableFilters: false,
    },
    {
      id: 'latestRun',
      Header: TableHeadings.LATEST_RUN_TIME,
      accessor: ({ lastSuccess, lastFailure }: Integration) => {
        const status = calculateStatus({ lastSuccess, lastFailure });
        return status.time;
      },
      Cell: ({ row }: Cell<Integration>) => {
        const latestRun = row.values.latestRun;
        if (latestRun == null || latestRun === 0) return '–';
        return (
          <RelativeTimeWithTooltip id="latest-run" time={latestRun as number} />
        );
      },
      disableSortBy: true,
      disableFilters: true,
    },
    {
      id: 'lastConnected',
      Header: TableHeadings.LAST_SEEN,
      accessor: ({ lastSuccess, lastFailure, lastSeen }: Integration) => {
        return calculateLatest([
          ...addIfExist(lastSuccess),
          ...addIfExist(lastFailure),
          ...addIfExist(lastSeen),
        ]);
      },
      Cell: ({ row }: Cell<Integration>) => {
        const lastConnected = row.values.lastConnected;
        if (lastConnected == null || lastConnected === 0) return '–';
        return (
          <RelativeTimeWithTooltip
            id="last-seen"
            time={lastConnected as number}
          />
        );
      },
      disableSortBy: true,
      disableFilters: true,
    },
    {
      id: 'schedule',
      Header: TableHeadings.SCHEDULE,
      accessor: 'schedule',
      Cell: ({ row }: Cell<Integration>) => {
        return <Schedule id="schedule" schedule={row.values.schedule} />;
      },
      disableSortBy: true,
      disableFilters: true,
    },
    {
      id: 'dataSetId',
      Header: ({ column }: HeaderProps<Integration>) => {
        return (
          <SorterIndicator name={TableHeadings.DATA_SET} column={column} />
        );
      },
      accessor: (row: Integration) => {
        return createSearchStringForDataSet(row.dataSetId, row.dataSet);
      },
      Cell: ({ row }: Cell<Integration>) => {
        const id = row.original.dataSet?.name ?? row.original.dataSetId;
        return (
          <DataSet
            id="data-set-id"
            dataSetId={row.original.dataSetId}
            dataSetName={`${id}`}
          />
        );
      },
      sortType: 'basic',
      disableSortBy: false,
      disableFilters: true,
    },
    {
      id: 'owner',
      Header: ({ column }: HeaderProps<Integration>) => {
        return <SorterIndicator name={TableHeadings.OWNER} column={column} />;
      },
      accessor: (row: Integration) => {
        return createSearchStringForContacts(row.contacts);
      },
      Cell: ({ row }: Cell<Integration>) => {
        const { contacts, id } = row.original;
        const noOwner = '–';
        if (contacts == null) return noOwner;
        const owner = contacts.find(
          (user) => user.role?.toLowerCase() === 'owner'
        );
        if (owner == null) return noOwner;
        return owner.name;
      },
      sortType: 'basic',
      disableSortBy: false,
      disableFilters: true,
    },
  ];
};
