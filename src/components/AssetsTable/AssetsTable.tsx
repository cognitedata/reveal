import { createLink } from '@cognite/cdf-utilities';
import { Table, TableNoResults } from '@cognite/cdf-utilities';

import { getContainer, handleError } from 'utils';
import { useSearchResource } from 'hooks/useSearchResource';
import { useTranslation } from 'common/i18n';
import ResourceProperty from 'components/Data/ResourceItem';
import moment from 'moment';

interface assetsTableProps {
  dataSetId: number;
  query: string;
}

const AssetsTable = ({ dataSetId, query }: assetsTableProps) => {
  const { t } = useTranslation();

  const getAssetsColumns = () => {
    return [
      {
        title: t('name'),
        dataIndex: 'name',
        key: 'dataset-assets-name',
        render: (_value: string, record: any) => (
          <ResourceProperty value={record.name} />
        ),
      },
      {
        title: t('id'),
        dataIndex: 'id',
        key: 'dataset-assets-id',
        render: (_value: string, record: any) => (
          <ResourceProperty value={record.id} />
        ),
      },
      {
        title: t('parent-external-id'),
        dataIndex: 'parent-external-id',
        key: 'dataset-assets-parent-external-id',
        render: (_value: string, record: any) => (
          <ResourceProperty value={record.parentExternalId} />
        ),
      },
      {
        title: t('source_one'),
        dataIndex: 'source',
        key: 'dataset-assets-source',
        render: (_value: string, record: any) => (
          <ResourceProperty value={record.source} />
        ),
      },
      {
        title: 'Updated',
        dataIndex: 'last-updated-time',
        key: 'dataset-assets-last-updated-time',
        render: (_value: string, record: any) => (
          <ResourceProperty
            value={moment(record.lastUpdatedTime).format('DD/MM/YYYY')}
          />
        ),
      },
      {
        title: 'Created',
        dataIndex: 'created-time',
        key: 'dataset-assets-created-time',
        render: (_value: string, record: any) => (
          <ResourceProperty
            value={moment(record.createdTime).format('DD/MM/YYYY')}
          />
        ),
      },
      {
        title: 'Id',
        dataIndex: 'id',
        key: 'dataset-assets-id',
        render: (_value: string, record: any) => (
          <ResourceProperty
            value={record.id}
            isLink
            redirectURL={createLink(`/explore/asset/${record.id}`)}
          />
        ),
      },
    ];
  };

  const { data: assets, isLoading: isAssetsLoading } = useSearchResource(
    'assets',
    dataSetId,
    query,
    {
      onError: (e: any) => {
        handleError({ message: t('assets-failed-to-fetch'), ...e });
      },
    }
  );

  return (
    <div id="assetsTableId">
      <Table
        rowKey="key"
        loading={isAssetsLoading}
        columns={[...getAssetsColumns()]}
        dataSource={assets || []}
        onChange={(_pagination, _filters) => {
          // sorter
          // TODO: Implement sorting
        }}
        getPopupContainer={getContainer}
        emptyContent={
          <TableNoResults
            title={t('data-set-list-no-records')}
            content={t('data-set-list-search-not-found', {
              $: '',
            })}
          />
        }
        appendTooltipTo={getContainer()}
      />
    </div>
  );
};

export default AssetsTable;
