import {
  Asset,
  CogniteEvent,
  FileInfo,
  Sequence,
  Timeseries,
} from '@cognite/sdk';
import { ColumnsType } from 'antd/es/table';
import { createLink } from '@cognite/cdf-utilities';
import ResourceProperty from './ResourceProperty';
import { useTranslation } from 'common/i18n';
import moment from 'moment';
import { useFlag } from '@cognite/react-feature-flags';
import { ExploreDataResourceTypes } from './ExploreData';

type TResource = Asset | Timeseries | FileInfo | CogniteEvent | Sequence;

export function useResourceTableColumns<T extends TResource>(
  resource: ExploreDataResourceTypes
): ColumnsType<T> {
  const { t } = useTranslation();

  const { isEnabled } = useFlag('data-catalog');

  const assets: ColumnsType<Asset> = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'dataset-assets-name',
      render: (_value, record) => <ResourceProperty value={record.name} />,
    },
    {
      title: t('source_one'),
      dataIndex: 'source',
      key: 'dataset-asset-source',
      render: (_value, record) => <ResourceProperty value={record?.source} />,
    },
    {
      title: t('external-id'),
      dataIndex: 'external-id',
      key: 'dataset-asset-external-id',
      render: (_value, record) => (
        <ResourceProperty value={record.externalId} />
      ),
    },
    {
      title: t('last-updated'),
      dataIndex: 'last-updated-time',
      key: 'dataset-asset-last-updated-time',
      render: (_value, record) => (
        <ResourceProperty
          value={moment(record.lastUpdatedTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      title: t('created'),
      dataIndex: 'created-time',
      key: 'dataset-asset-created-time',
      render: (_value, record) => (
        <ResourceProperty
          value={moment(record.createdTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'dataset-asset-id',
      render: (_value, record) => (
        <ResourceProperty
          value={record.id}
          isLink
          redirectURL={createLink(`/explore/asset/${record.id}`)}
        />
      ),
    },
  ];

  const events: ColumnsType<CogniteEvent> = [
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'dataset-event-type',
      render: (_value, record) => <ResourceProperty value={record.type} />,
    },
    {
      title: t('subtype'),
      dataIndex: 'sub-type',
      key: 'dataset-event-sub-type',
      render: (_value, record) => <ResourceProperty value={record.subtype} />,
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'dataset-event-description',
      render: (_value, record) => (
        <ResourceProperty value={record.description} />
      ),
    },
    {
      title: t('last-updated'),
      dataIndex: 'last-updated-time',
      key: 'dataset-event-last-updated-time',
      render: (_value, record) => (
        <ResourceProperty
          value={moment(record.lastUpdatedTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      title: t('created'),
      dataIndex: 'created-time',
      key: 'dataset-event-created-time',
      render: (_value, record) => (
        <ResourceProperty
          value={moment(record.createdTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'dataset-event-id',
      render: (_value, record) => (
        <ResourceProperty
          value={record.id}
          isLink
          redirectURL={createLink(`/explore/event/${record.id}`)}
        />
      ),
    },
  ];

  const files: ColumnsType<FileInfo> = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'dataset-file-name',
      width: '20%',
      render: (_value, record) => <ResourceProperty value={record.name} />,
    },
    {
      title: t('source_one'),
      dataIndex: 'source',
      key: 'dataset-file-source',
      render: (_value, record) => <ResourceProperty value={record.source} />,
    },
    {
      title: t('last-updated'),
      dataIndex: 'last-updated-time',
      key: 'dataset-file-last-updated-time',
      render: (_value, record) => (
        <ResourceProperty
          value={moment(record.lastUpdatedTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      title: t('created'),
      dataIndex: 'created-time',
      key: 'dataset-file-created-time',
      render: (_value, record) => (
        <ResourceProperty
          value={moment(record.createdTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'dataset-file-id',
      render: (_value, record) => (
        <ResourceProperty
          value={record.id}
          isLink
          redirectURL={createLink(`/explore/file/${record.id}`)}
        />
      ),
    },
  ];

  const sequences: ColumnsType<Sequence> = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'dataset-sequence-name',
      render: (_value, record) => <ResourceProperty value={record.name} />,
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'dataset-sequence-description',
      width: '25%',
      render: (_value, record) => (
        <ResourceProperty value={record.description} />
      ),
    },
    {
      title: t('last-updated'),
      dataIndex: 'last-updated-time',
      key: 'dataset-sequence-last-updated-time',
      render: (_value, record) => (
        <ResourceProperty
          value={moment(record.lastUpdatedTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      title: t('created'),
      dataIndex: 'created-time',
      key: 'dataset-sequence-created-time',
      render: (_value, record) => (
        <ResourceProperty
          value={moment(record.createdTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'dataset-sequence-id',
      render: (_value, record) => (
        <ResourceProperty
          value={record.id}
          isLink
          redirectURL={createLink(`/explore/sequence/${record.id}`)}
        />
      ),
    },
  ];

  const timeseries: ColumnsType<Timeseries> = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'dataset-timeseries-name',
      render: (_value, record) => <ResourceProperty value={record.name} />,
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'dataset-timeseries-description',
      width: '25%',
      render: (_value, record) => (
        <ResourceProperty value={record.description} />
      ),
    },
    {
      title: t('external-id'),
      dataIndex: 'external-id',
      key: 'dataset-timeseries-external-id',
      render: (_value, record) => (
        <ResourceProperty value={record.externalId} />
      ),
    },
    {
      title: t('asset-id'),
      dataIndex: 'asset-id',
      key: 'dataset-timeseries-asset-id',
      render: (_value, record) => (
        <ResourceProperty value={record.assetId || '-'} />
      ),
    },
    {
      title: t('last-updated'),
      dataIndex: 'last-updated-time',
      key: 'dataset-timeseries-last-updated-time',
      render: (_value, record) => (
        <ResourceProperty
          value={moment(record.lastUpdatedTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      title: t('created'),
      dataIndex: 'created-time',
      key: 'dataset-timeseries-created-time',
      render: (_value, record) => (
        <ResourceProperty
          value={moment(record.createdTime).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'dataset-timeseries-id',
      render: (_value, record) => (
        <ResourceProperty
          value={record.id}
          isLink
          redirectURL={createLink(`/explore/timeSeries/${record.id}`)}
        />
      ),
    },
  ];

  if (isEnabled) {
    events.splice(3, 0, {
      title: t('external-id'),
      dataIndex: 'external-id',
      key: 'dataset-events-external-id',
      render: (_value, record) => (
        <ResourceProperty value={record.externalId} />
      ),
    });

    files.splice(2, 0, {
      title: t('external-id'),
      dataIndex: 'external-id',
      key: 'dataset-files-external-id',
      render: (_value, record) => (
        <ResourceProperty value={record.externalId} />
      ),
    });

    sequences.splice(2, 0, {
      title: t('external-id'),
      dataIndex: 'external-id',
      key: 'dataset-sequences-external-id',
      render: (_value, record) => (
        <ResourceProperty value={record.externalId} />
      ),
    });
  }

  switch (resource) {
    case 'assets':
      return assets as ColumnsType<T>;
    case 'events':
      return events as ColumnsType<T>;
    case 'files':
      return files as ColumnsType<T>;
    case 'sequences':
      return sequences as ColumnsType<T>;
    case 'timeseries':
      return timeseries as ColumnsType<T>;
  }
}
