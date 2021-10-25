import React, { useState, useEffect } from 'react';
import { ItemLabel } from 'utils/styledComponents';
import Table from 'antd/lib/table';
import { Asset } from '@cognite/sdk';
import sdk from '@cognite/cdf-sdk-singleton';
import { ExploreViewConfig } from 'utils/types';
import { Button } from '@cognite/cogs.js';
import handleError from 'utils/handleError';
import { getContainer } from 'utils/utils';
import ColumnWrapper from '../ColumnWrapper';

interface assetsTableProps {
  dataSetId: number;
  setExploreView(value: ExploreViewConfig): void;
}

const AssetsTable = ({ setExploreView, dataSetId }: assetsTableProps) => {
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
          <Button
            type="link"
            onClick={() =>
              setExploreView({
                type: 'asset',
                id: record.id,
                visible: true,
              })
            }
          >
            Preview
          </Button>
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
        pagination={{ pageSize: 5 }}
        expandIcon={() => <span />}
        getPopupContainer={getContainer}
      />
    </div>
  );
};

export default AssetsTable;
