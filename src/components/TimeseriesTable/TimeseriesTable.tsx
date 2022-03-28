import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ItemLabel } from 'utils/styledComponents';
import Table from 'antd/lib/table';
import { Timeseries } from '@cognite/sdk';
import { createLink } from '@cognite/cdf-utilities';
import handleError from 'utils/handleError';
import { getContainer } from 'utils/shared';
import { DEFAULT_ANTD_TABLE_PAGINATION } from 'utils/tableUtils';
import sdk from '@cognite/cdf-sdk-singleton';
import ColumnWrapper from '../ColumnWrapper';

interface TimeseriesPreviewProps {
  dataSetId: number;
}

const TimeseriesPreview = ({ dataSetId }: TimeseriesPreviewProps) => {
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
      render: (record: Timeseries) => {
        return (
          <span>
            <Link to={createLink(`/explore/timeSeries/${record.id}`)}>
              View
            </Link>
          </span>
        );
      },
    },
  ];

  return (
    <div id="#timeseries">
      <ItemLabel>Timeseries</ItemLabel>
      <Table
        rowKey="id"
        columns={timeseriesColumns}
        dataSource={timeseries}
        pagination={DEFAULT_ANTD_TABLE_PAGINATION}
        getPopupContainer={getContainer}
      />
    </div>
  );
};

export default TimeseriesPreview;
