import { Link } from 'react-router-dom';
import { Asset } from '@cognite/sdk';
import { createLink } from '@cognite/cdf-utilities';
import { Table, TableNoResults } from '@cognite/cdf-utilities';

import AntdTable from 'antd/lib/table';
import ColumnWrapper from '../ColumnWrapper';

import {
  ItemLabel,
  getContainer,
  handleError,
  DEFAULT_ANTD_TABLE_PAGINATION,
} from 'utils';
import { useSearchResource } from 'hooks/useSearchResource';
import { useTranslation } from 'common/i18n';

interface assetsTableProps {
  dataSetId: number;
  query: string;
}

const AssetsTable = ({ dataSetId, query }: assetsTableProps) => {
  const { t } = useTranslation();

  const assetColumns = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
      render: (value: any) => <ColumnWrapper title={value} />,
    },
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      render: (value: any) => <ColumnWrapper title={value} />,
    },
    {
      title: t('parent-external-id'),
      dataIndex: 'parentExternalId',
      key: 'parentExternalId',
    },
    {
      title: t('source_one'),
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: t('action_other'),
      render: (record: Asset) => (
        <span>
          <Link to={createLink(`/explore/asset/${record.id}`)}>
            {t('view')}
          </Link>
        </span>
      ),
    },
  ];

  const { data: assets } = useSearchResource('assets', dataSetId, query, {
    onError: (e: any) => {
      handleError({ message: t('assets-failed-to-fetch'), ...e });
    },
  });

  return (
    <div>
      <ItemLabel>{t('assets')}</ItemLabel>
      <AntdTable
        rowKey="id"
        columns={assetColumns}
        dataSource={assets}
        pagination={DEFAULT_ANTD_TABLE_PAGINATION}
        expandIcon={() => <span />}
        getPopupContainer={getContainer}
      />
    </div>
  );
};

export default AssetsTable;
