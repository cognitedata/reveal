import moment from 'moment';

import { createLink } from '@cognite/cdf-utilities';
import { useFlag } from '@cognite/react-feature-flags';
import {
  Asset,
  CogniteEvent,
  FileInfo,
  Sequence,
  Timeseries,
} from '@cognite/sdk';

import { useTranslation } from '../../common/i18n';
import { CogsTableCellRenderer, trackUsage } from '../../utils';

import ResourceProperty from './ResourceProperty';

export function useResourceTableColumns() {
  const { t } = useTranslation();

  const { isEnabled } = useFlag('data-catalog');

  const ResourcePropertyClickHandler = (
    tableKey: string,
    resourcePropertyId?: string | number
  ) => {
    if (resourcePropertyId) {
      trackUsage({
        e: 'data.sets.detail.data.navigate.explore.resource',
        resourceType: tableKey,
        resourceId: resourcePropertyId,
      });
    }
  };

  const assetColumns = [
    {
      Header: t('name'),
      accessor: 'name',
      id: 'dataset-assets-name',
      disableSortBy: true,
      Cell: ({ row: { original: record } }: CogsTableCellRenderer<Asset>) => (
        <ResourceProperty value={record.name} />
      ),
    },
    {
      Header: t('source_one'),
      accessor: 'source',
      id: 'dataset-asset-source',
      disableSortBy: true,
      Cell: ({ row: { original: record } }: CogsTableCellRenderer<Asset>) => (
        <ResourceProperty value={record.source} />
      ),
    },
    {
      Header: t('external-id'),
      accessor: 'external-id',
      id: 'dataset-asset-external-id',
      disableSortBy: true,
      Cell: ({ row: { original: record } }: CogsTableCellRenderer<Asset>) => (
        <ResourceProperty value={record.externalId} />
      ),
    },
    {
      Header: t('last-updated'),
      accessor: 'last-updated-time',
      id: 'dataset-asset-last-updated-time',
      disableSortBy: true,
      Cell: ({ row: { original: record } }: CogsTableCellRenderer<Asset>) => (
        <ResourceProperty
          value={moment(record.lastUpdatedTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      Header: t('created'),
      accessor: 'created-time',
      id: 'dataset-asset-created-time',
      disableSortBy: true,
      Cell: ({ row: { original: record } }: CogsTableCellRenderer<Asset>) => (
        <ResourceProperty
          value={moment(record.createdTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      Header: t('id'),
      accessor: 'id',
      id: 'dataset-asset-id',
      disableSortBy: true,
      Cell: ({ row: { original: record } }: CogsTableCellRenderer<Asset>) => (
        <ResourceProperty
          value={record.id}
          isLink
          redirectURL={createLink(`/explore/asset/${record.id}`)}
          onClick={() => ResourcePropertyClickHandler('assets', record.id)}
        />
      ),
    },
  ];

  const eventColumns = [
    {
      Header: t('type'),
      accessor: 'type',
      id: 'dataset-event-type',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<CogniteEvent>) => (
        <ResourceProperty value={record.type} />
      ),
    },
    {
      Header: t('subtype'),
      accessor: 'sub-type',
      id: 'dataset-event-sub-type',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<CogniteEvent>) => (
        <ResourceProperty value={record.subtype} />
      ),
    },
    {
      Header: t('description'),
      accessor: 'description',
      id: 'dataset-event-description',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<CogniteEvent>) => (
        <ResourceProperty value={record.description} />
      ),
    },
    {
      Header: t('last-updated'),
      accessor: 'last-updated-time',
      id: 'dataset-event-last-updated-time',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<CogniteEvent>) => (
        <ResourceProperty
          value={moment(record.lastUpdatedTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      Header: t('created'),
      accessor: 'created-time',
      id: 'dataset-event-created-time',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<CogniteEvent>) => (
        <ResourceProperty
          value={moment(record.createdTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      Header: t('id'),
      accessor: 'id',
      id: 'dataset-event-id',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<CogniteEvent>) => (
        <ResourceProperty
          value={record.id}
          isLink
          redirectURL={createLink(`/explore/event/${record.id}`)}
          onClick={() => ResourcePropertyClickHandler('events', record.id)}
        />
      ),
    },
  ];

  const fileColumns = [
    {
      Header: t('name'),
      accessor: 'name',
      id: 'dataset-file-name',
      width: '20%',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<FileInfo>) => (
        <ResourceProperty value={record.name} />
      ),
    },
    {
      Header: t('source_one'),
      accessor: 'source',
      id: 'dataset-file-source',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<FileInfo>) => (
        <ResourceProperty value={record.source} />
      ),
    },
    {
      Header: t('last-updated'),
      accessor: 'last-updated-time',
      id: 'dataset-file-last-updated-time',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<FileInfo>) => (
        <ResourceProperty
          value={moment(record.lastUpdatedTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      Header: t('created'),
      accessor: 'created-time',
      id: 'dataset-file-created-time',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<FileInfo>) => (
        <ResourceProperty
          value={moment(record.createdTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      Header: t('id'),
      accessor: 'id',
      id: 'dataset-file-id',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<FileInfo>) => (
        <ResourceProperty
          value={record.id}
          isLink
          redirectURL={createLink(`/explore/file/${record.id}`)}
          onClick={() => ResourcePropertyClickHandler('files', record.id)}
        />
      ),
    },
  ];

  const sequenceColumns = [
    {
      Header: t('name'),
      accessor: 'name',
      id: 'dataset-sequence-name',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<Sequence>) => (
        <ResourceProperty value={record.name} />
      ),
    },
    {
      Header: t('description'),
      accessor: 'description',
      id: 'dataset-sequence-description',
      // keep it here, we will need it once we move it into fusion
      width: '25%',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<Sequence>) => (
        <ResourceProperty value={record.description} />
      ),
    },
    {
      Header: t('last-updated'),
      accessor: 'last-updated-time',
      id: 'dataset-sequence-last-updated-time',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<Sequence>) => (
        <ResourceProperty
          value={moment(record.lastUpdatedTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      Header: t('created'),
      accessor: 'created-time',
      id: 'dataset-sequence-created-time',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<Sequence>) => (
        <ResourceProperty
          value={moment(record.createdTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      Header: t('id'),
      accessor: 'id',
      id: 'dataset-sequence-id',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<Sequence>) => (
        <ResourceProperty
          value={record.id}
          isLink
          redirectURL={createLink(`/explore/sequence/${record.id}`)}
          onClick={() => ResourcePropertyClickHandler('sequences', record.id)}
        />
      ),
    },
  ];

  const timeseriesColumns = [
    {
      Header: t('name'),
      accessor: 'name',
      id: 'dataset-timeseries-name',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<Timeseries>) => (
        <ResourceProperty value={record.name} />
      ),
    },
    {
      Header: t('description'),
      accessor: 'description',
      id: 'dataset-timeseries-description',
      // keep it here, we will need it once we move it into fusion
      width: '25%',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<Timeseries>) => (
        <ResourceProperty value={record.description} />
      ),
    },
    {
      Header: t('external-id'),
      accessor: 'external-id',
      id: 'dataset-timeseries-external-id',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<Timeseries>) => (
        <ResourceProperty value={record.externalId} />
      ),
    },
    {
      Header: t('asset-id'),
      accessor: 'asset-id',
      id: 'dataset-timeseries-asset-id',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<Timeseries>) => (
        <ResourceProperty value={record.assetId || '-'} />
      ),
    },
    {
      Header: t('last-updated'),
      accessor: 'last-updated-time',
      id: 'dataset-timeseries-last-updated-time',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<Timeseries>) => (
        <ResourceProperty
          value={moment(record.lastUpdatedTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      Header: t('created'),
      accessor: 'created-time',
      id: 'dataset-timeseries-created-time',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<Timeseries>) => (
        <ResourceProperty
          value={moment(record.createdTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      Header: t('id'),
      accessor: 'id',
      id: 'dataset-timeseries-id',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<Timeseries>) => (
        <ResourceProperty
          value={record.id}
          isLink
          redirectURL={createLink(`/explore/timeSeries/${record.id}`)}
          onClick={() => ResourcePropertyClickHandler('timeseries', record.id)}
        />
      ),
    },
  ];

  if (isEnabled) {
    eventColumns.splice(3, 0, {
      Header: t('external-id'),
      accessor: 'external-id',
      id: 'dataset-events-external-id',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<CogniteEvent>) => (
        <ResourceProperty value={record.externalId} />
      ),
    });

    fileColumns.splice(2, 0, {
      Header: t('external-id'),
      accessor: 'external-id',
      id: 'dataset-files-external-id',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<FileInfo>) => (
        <ResourceProperty value={record.externalId} />
      ),
    });

    sequenceColumns.splice(2, 0, {
      Header: t('external-id'),
      accessor: 'external-id',
      id: 'dataset-sequences-external-id',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<Sequence>) => (
        <ResourceProperty value={record.externalId} />
      ),
    });
  }

  return {
    assetColumns,
    eventColumns,
    fileColumns,
    sequenceColumns,
    timeseriesColumns,
  };
}
