import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ItemLabel } from 'utils/styledComponents';
import Table from 'antd/lib/table';
import { Asset } from '@cognite/sdk';
import sdk from '@cognite/cdf-sdk-singleton';
import { createLink } from '@cognite/cdf-utilities';
import handleError from 'utils/handleError';
import { getContainer } from 'utils/shared';
import { DEFAULT_ANTD_TABLE_PAGINATION } from 'utils/tableUtils';
import ColumnWrapper from '../ColumnWrapper';
import { useTranslation } from 'common/i18n';

interface assetsTableProps {
  dataSetId: number;
}

const AssetsTable = ({ dataSetId }: assetsTableProps) => {
  const { t } = useTranslation();
  const [assets, setAssets] = useState<Asset[]>();

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
      title: t('source'),
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

  useEffect(() => {
    sdk.assets
      .list({ filter: { dataSetIds: [{ id: dataSetId }] } })
      .then((res) => {
        setAssets(res.items);
      })
      .catch((e) => {
        handleError({ message: t('assets-failed-to-fetch'), ...e });
      });
  }, [dataSetId, t]);

  return (
    <div>
      <ItemLabel>{t('assets')}</ItemLabel>
      <Table
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
