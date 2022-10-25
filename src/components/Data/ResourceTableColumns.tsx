import {
  Asset,
  CogniteEvent,
  FileInfo,
  Sequence,
  Timeseries,
} from '@cognite/sdk';
import { createLink } from '@cognite/cdf-utilities';
import ResourceProperty from './ResourceProperty';
import { useTranslation } from 'common/i18n';
import moment from 'moment';
import { useFlag } from '@cognite/react-feature-flags';

export const useResourceTableColumns = () => {
  const { t } = useTranslation();

  const { isEnabled } = useFlag('data-catalog');

  const resourceTableColumns = {
    assets: [
      {
        title: t('name'),
        dataIndex: 'name',
        key: 'dataset-assets-name',
        render: (_value: string, record: Asset) => (
          <ResourceProperty value={record.name} />
        ),
      },
      {
        title: t('external-id'),
        dataIndex: 'external-id',
        key: 'dataset-asset-external-id',
        render: (_value: string, record: Asset) => (
          <ResourceProperty value={record.externalId} />
        ),
      },
      {
        title: t('source_one'),
        dataIndex: 'source',
        key: 'dataset-asset-source',
        render: (_value: string, record: Asset) => (
          <ResourceProperty value={record?.source} />
        ),
      },
      {
        title: t('last-updated'),
        dataIndex: 'last-updated-time',
        key: 'dataset-asset-last-updated-time',
        render: (_value: string, record: Asset) => (
          <ResourceProperty
            value={moment(record.lastUpdatedTime).format('DD/MM/YYYY')}
          />
        ),
      },
      {
        title: t('created'),
        dataIndex: 'created-time',
        key: 'dataset-asset-created-time',
        render: (_value: string, record: Asset) => (
          <ResourceProperty
            value={moment(record.createdTime).format('DD/MM/YYYY')}
          />
        ),
      },
      {
        title: t('id'),
        dataIndex: 'id',
        key: 'dataset-asset-id',
        render: (_value: string, record: Asset) => (
          <ResourceProperty
            value={record.id}
            isLink
            redirectURL={createLink(`/explore/asset/${record.id}`)}
          />
        ),
      },
    ],
    events: [
      {
        title: t('type'),
        dataIndex: 'type',
        key: 'dataset-event-type',
        render: (_value: string, record: CogniteEvent) => (
          <ResourceProperty value={record.type} />
        ),
      },
      {
        title: t('subtype'),
        dataIndex: 'sub-type',
        key: 'dataset-event-sub-type',
        render: (_value: string, record: CogniteEvent) => (
          <ResourceProperty value={record.subtype} />
        ),
      },
      {
        title: t('description'),
        dataIndex: 'description',
        key: 'dataset-event-description',
        render: (_value: string, record: CogniteEvent) => (
          <ResourceProperty value={record.description} />
        ),
      },
      {
        title: t('last-updated'),
        dataIndex: 'last-updated-time',
        key: 'dataset-event-last-updated-time',
        render: (_value: string, record: CogniteEvent) => (
          <ResourceProperty
            value={moment(record.lastUpdatedTime).format('DD/MM/YYYY')}
          />
        ),
      },
      {
        title: t('created'),
        dataIndex: 'created-time',
        key: 'dataset-event-created-time',
        render: (_value: string, record: CogniteEvent) => (
          <ResourceProperty
            value={moment(record.createdTime).format('DD/MM/YYYY')}
          />
        ),
      },
      {
        title: t('id'),
        dataIndex: 'id',
        key: 'dataset-event-id',
        render: (_value: string, record: CogniteEvent) => (
          <ResourceProperty
            value={record.id}
            isLink
            redirectURL={createLink(`/explore/event/${record.id}`)}
          />
        ),
      },
      isEnabled && {
        title: t('external-id'),
        dataIndex: 'external-id',
        key: 'dataset-events-external-id',
        render: (_value: string, record: Asset) => (
          <ResourceProperty value={record.externalId} />
        ),
      },
    ],
    files: [
      {
        title: t('name'),
        dataIndex: 'name',
        key: 'dataset-file-name',
        render: (_value: string, record: FileInfo) => (
          <ResourceProperty value={record.name} />
        ),
      },
      isEnabled && {
        title: t('external-id'),
        dataIndex: 'external-id',
        key: 'dataset-files-external-id',
        render: (_value: string, record: Asset) => (
          <ResourceProperty value={record.externalId} />
        ),
      },
      {
        title: t('source_one'),
        dataIndex: 'source',
        key: 'dataset-file-source',
        render: (_value: string, record: FileInfo) => (
          <ResourceProperty value={record.source} />
        ),
      },
      {
        title: t('last-updated'),
        dataIndex: 'last-updated-time',
        key: 'dataset-file-last-updated-time',
        render: (_value: string, record: FileInfo) => (
          <ResourceProperty
            value={moment(record.lastUpdatedTime).format('DD/MM/YYYY')}
          />
        ),
      },
      {
        title: t('created'),
        dataIndex: 'created-time',
        key: 'dataset-file-created-time',
        render: (_value: string, record: FileInfo) => (
          <ResourceProperty
            value={moment(record.createdTime).format('DD/MM/YYYY')}
          />
        ),
      },
      {
        title: t('id'),
        dataIndex: 'id',
        key: 'dataset-file-id',
        render: (_value: string, record: FileInfo) => (
          <ResourceProperty
            value={record.id}
            isLink
            redirectURL={createLink(`/explore/file/${record.id}`)}
          />
        ),
      },
    ],
    sequences: [
      {
        title: t('name'),
        dataIndex: 'name',
        key: 'dataset-sequence-name',
        render: (_value: string, record: Sequence) => (
          <ResourceProperty value={record.name} />
        ),
      },
      isEnabled && {
        title: t('external-id'),
        dataIndex: 'external-id',
        key: 'dataset-sequences-external-id',
        render: (_value: string, record: Asset) => (
          <ResourceProperty value={record.externalId} />
        ),
      },
      {
        title: t('description'),
        dataIndex: 'description',
        key: 'dataset-sequence-description',
        render: (_value: string, record: Sequence) => (
          <ResourceProperty value={record.description} />
        ),
      },
      {
        title: t('last-updated'),
        dataIndex: 'last-updated-time',
        key: 'dataset-sequence-last-updated-time',
        render: (_value: string, record: Sequence) => (
          <ResourceProperty
            value={moment(record.lastUpdatedTime).format('DD/MM/YYYY')}
          />
        ),
      },
      {
        title: t('created'),
        dataIndex: 'created-time',
        key: 'dataset-sequence-created-time',
        render: (_value: string, record: Sequence) => (
          <ResourceProperty
            value={moment(record.createdTime).format('DD/MM/YYYY')}
          />
        ),
      },
      {
        title: t('id'),
        dataIndex: 'id',
        key: 'dataset-sequence-id',
        render: (_value: string, record: Sequence) => (
          <ResourceProperty
            value={record.id}
            isLink
            redirectURL={createLink(`/explore/sequence/${record.id}`)}
          />
        ),
      },
    ],
    timeseries: [
      {
        title: t('name'),
        dataIndex: 'name',
        key: 'dataset-timeseries-name',
        render: (_value: string, record: Timeseries) => (
          <ResourceProperty value={record.name} />
        ),
      },
      {
        title: t('description'),
        dataIndex: 'description',
        key: 'dataset-timeseries-description',
        render: (_value: string, record: Timeseries) => (
          <ResourceProperty value={record.description} />
        ),
      },
      {
        title: t('external-id'),
        dataIndex: 'external-id',
        key: 'dataset-timeseries-external-id',
        render: (_value: string, record: Timeseries) => (
          <ResourceProperty value={record.externalId} />
        ),
      },
      {
        title: t('asset-id'),
        dataIndex: 'asset-id',
        key: 'dataset-timeseries-asset-id',
        render: (_value: string, record: Timeseries) => (
          <ResourceProperty value={record.assetId} />
        ),
      },
      {
        title: t('last-updated'),
        dataIndex: 'last-updated-time',
        key: 'dataset-timeseries-last-updated-time',
        render: (_value: string, record: Timeseries) => (
          <ResourceProperty
            value={moment(record.lastUpdatedTime).format('DD/MM/YYYY')}
          />
        ),
      },
      {
        title: t('created'),
        dataIndex: 'created-time',
        key: 'dataset-timeseries-created-time',
        render: (_value: string, record: Timeseries) => (
          <ResourceProperty
            value={moment(record.createdTime).format('DD/MM/YYYY')}
          />
        ),
      },
      {
        title: t('id'),
        dataIndex: 'id',
        key: 'dataset-timeseries-id',
        render: (_value: string, record: Timeseries) => (
          <ResourceProperty
            value={record.id}
            isLink
            redirectURL={createLink(`/explore/timeSeries/${record.id}`)}
          />
        ),
      },
    ],
  };

  const getResourceTableColumns = (
    resource: string
  ): {
    title: string;
    dataIndex: string;
    key: string;
    render: (_value: string, record: any) => JSX.Element;
  }[] => {
    return resourceTableColumns[resource as keyof typeof resourceTableColumns];
  };

  return { getResourceTableColumns };
};
