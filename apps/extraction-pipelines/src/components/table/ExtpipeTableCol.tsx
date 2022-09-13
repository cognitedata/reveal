import React from 'react';
import { Cell, CellProps, Column, HeaderProps } from 'react-table';
import { addIfExist, calculateLatest } from 'utils/extpipeUtils';
import { Extpipe } from 'model/Extpipe';
import Name from 'components/extpipes/cols/Name';
import Schedule from 'components/extpipes/cols/Schedule';
import { DataSet } from 'components/extpipes/cols/DataSet';
import { LastRunStatusMarker } from 'components/extpipes/cols/StatusMarker';
import { User } from 'model/User';
import RelativeTimeWithTooltip from 'components/extpipes/cols/RelativeTimeWithTooltip';
import SorterIndicator from 'components/table/SorterIndicator';
import { DataSetModel } from 'model/DataSetModel';
import { TranslationKeys } from 'common';

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

export const createSearchStringForContacts = (contacts?: User[]) => {
  return `${contacts?.length ? contacts.map((aut) => aut.name).join() : ''}`;
};
export const createSearchStringForDataSet = (
  dataSetId: number,
  dataSet?: DataSetModel
) => {
  return `${dataSetId} ${dataSet ? dataSet.name : ''}`;
};

export const getExtpipeTableColumns = (
  _t: (key: TranslationKeys) => string
) => {
  const extpipeTableColumns: Column<Extpipe>[] = [
    {
      id: 'name',
      Header: ({ column }: HeaderProps<Extpipe>) => {
        return (
          <SorterIndicator
            name={_t('name') || TableHeadings.NAME}
            column={column}
          />
        );
      },
      accessor: 'name',
      Cell: ({ row }: CellProps<Extpipe>) => {
        return (
          <Name
            name={row.values.name}
            extpipeId={`${row.original.id}`}
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
      Header: _t('last-run-status') || TableHeadings.LAST_RUN_STATUS,

      Cell: ({ row }: CellProps<Extpipe>) => {
        return <LastRunStatusMarker externalId={row.values.externalId!} />;
      },
      disableSortBy: true,
      disableFilters: true,
    },
    {
      id: 'latestRun',
      Header: ({ column }: HeaderProps<Extpipe>) => {
        return (
          <SorterIndicator
            name={_t('last-run-time') || TableHeadings.LATEST_RUN_TIME}
            column={column}
          />
        );
      },
      accessor: ({ lastSuccess, lastFailure }: Extpipe) => {
        return calculateLatest([
          ...addIfExist(lastSuccess),
          ...addIfExist(lastFailure),
        ]);
      },
      // @ts-ignore
      Cell: ({ row }: Cell<Extpipe>) => {
        const { latestRun } = row.values;
        if (latestRun == null || latestRun === 0) return '–';
        return (
          <RelativeTimeWithTooltip id="latest-run" time={latestRun as number} />
        );
      },
      disableSortBy: false,
      disableFilters: true,
    },
    {
      id: 'lastConnected',
      Header: ({ column }: HeaderProps<Extpipe>) => {
        return (
          <SorterIndicator
            name={_t('last-seen') || TableHeadings.LAST_SEEN}
            column={column}
          />
        );
      },
      accessor: ({ lastSuccess, lastFailure, lastSeen }: Extpipe) => {
        return calculateLatest([
          ...addIfExist(lastSuccess),
          ...addIfExist(lastFailure),
          ...addIfExist(lastSeen),
        ]);
      },
      // @ts-ignore
      Cell: ({ row }: Cell<Extpipe>) => {
        const { lastConnected } = row.values;
        if (lastConnected == null || lastConnected === 0) return '–';
        return (
          <RelativeTimeWithTooltip
            id="last-seen"
            time={lastConnected as number}
          />
        );
      },
      disableSortBy: false,
      disableFilters: true,
    },
    {
      id: 'schedule',
      Header: _t('schedule') || TableHeadings.SCHEDULE,
      accessor: 'schedule',
      // @ts-ignore
      Cell: ({ row }: Cell<Extpipe>) => {
        return <Schedule id="schedule" schedule={row.values.schedule} />;
      },
      disableSortBy: true,
      disableFilters: true,
    },
    {
      id: 'dataSetId',
      Header: ({ column }: HeaderProps<Extpipe>) => {
        return (
          <SorterIndicator
            name={_t('data-set') || TableHeadings.DATA_SET}
            column={column}
          />
        );
      },
      accessor: (row: Extpipe) => {
        return row.dataSetId;
      },
      // @ts-ignore
      Cell: ({ row }: Cell<Extpipe>) => {
        return <DataSet dataSetId={row.original.dataSetId} />;
      },
      sortType: 'basic',
      disableSortBy: false,
      disableFilters: true,
    },
    {
      id: 'owner',
      Header: ({ column }: HeaderProps<Extpipe>) => {
        return (
          <SorterIndicator
            name={_t('owner') || TableHeadings.OWNER}
            column={column}
          />
        );
      },
      accessor: (row: Extpipe) => {
        return createSearchStringForContacts(row.contacts);
      },
      // @ts-ignore
      Cell: ({ row }: Cell<Extpipe>) => {
        const { contacts } = row.original;
        const noOwner = '–';
        if (contacts == null) return <>{noOwner}</>;
        const owner = contacts.find(
          (user) => user.role?.toLowerCase() === 'owner'
        );
        if (owner == null) return <>{noOwner}</>;
        const displayName = owner.name ?? owner.email;
        return <span>{displayName}</span>;
      },
      sortType: 'basic',
      disableSortBy: false,
      disableFilters: true,
    },
  ];

  return { extpipeTableColumns };
};
