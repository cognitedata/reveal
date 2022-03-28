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

interface assetsTableProps {
  dataSetId: number;
}

const AssetsTable = ({ dataSetId }: assetsTableProps) => {
  const [assets, setAssets] = useState<Asset[]>();

  const assetColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value: any) => <ColumnWrapper title={value} />,
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (value: any) => <ColumnWrapper title={value} />,
    },
    {
      title: 'Parent external ID',
      dataIndex: 'parentExternalId',
      key: 'parentExternalId',
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: 'Actions',
      render: (record: Asset) => (
        <span>
          <Link to={createLink(`/explore/asset/${record.id}`)}>View</Link>
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
        handleError({ message: 'Failed to fetch assets', ...e });
      });
  }, [dataSetId]);

  return (
    <div>
      <ItemLabel>Assets</ItemLabel>
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
