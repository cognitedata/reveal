import React, { useState, useEffect } from 'react';
import { ItemLabel } from 'utils/styledComponents';
import Table from 'antd/lib/table';
import { Timeseries } from '@cognite/sdk';
import { Button } from '@cognite/cogs.js';
import handleError from 'utils/handleError';
import { getContainer } from 'utils/utils';
import sdk from '@cognite/cdf-sdk-singleton';
import { ExploreViewConfig } from '../../utils/types';
import ColumnWrapper from '../ColumnWrapper';

interface TimeseriesPreviewProps {
  dataSetId: number;
  setExploreView(value: ExploreViewConfig): void;
}

const TimeseriesPreview = ({
  setExploreView,
  dataSetId,
}: TimeseriesPreviewProps) => {
  const [timeseries, setTimeseries] = useState<Timeseries[]>();

  useEffect(() => {
    sdk.timeseries
      .list({ filter: { dataSetIds: [{ id: dataSetId }] } })
      .then((res) => setTimeseries(res.items))
      .catch((e) =>
        handleError({ message: 'Failed to fetch timeseries', ...e })
      );
  }, [dataSetId]);

  const timeseriesColumns = [
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
      title: 'External ID',
      dataIndex: 'externalId',
      key: 'externalId',
      render: (value: any) => <ColumnWrapper title={value} />,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Asset ID',
      dataIndex: 'assetId',
      key: 'assetId',
      render: (value: any) => <ColumnWrapper title={value} />,
    },
    {
      title: 'Actions',
      render: (record: Timeseries) => (
        <span>
          <Button
            type="link"
            onClick={() =>
              setExploreView({
                type: 'ts',
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

  return (
    <div id="#timeseries">
      <ItemLabel>Timeseries</ItemLabel>
      <Table
        rowKey="id"
        columns={timeseriesColumns}
        dataSource={timeseries}
        pagination={{ pageSize: 5 }}
        getPopupContainer={getContainer}
      />
    </div>
  );
};

export default TimeseriesPreview;
