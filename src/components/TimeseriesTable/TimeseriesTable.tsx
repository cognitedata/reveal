import { Link } from 'react-router-dom';
import { ItemLabel } from 'utils/styledComponents';
import Table from 'antd/lib/table';
import { Timeseries } from '@cognite/sdk';
import { createLink } from '@cognite/cdf-utilities';
import handleError from 'utils/handleError';
import {
  getContainer,
  getResourceSearchParams,
  getResourceSearchQueryKey,
} from 'utils/shared';
import { DEFAULT_ANTD_TABLE_PAGINATION } from 'utils/tableUtils';
import sdk from '@cognite/cdf-sdk-singleton';
import ColumnWrapper from '../ColumnWrapper';
import { useTranslation } from 'common/i18n';
import { useQuery } from 'react-query';

interface TimeseriesPreviewProps {
  dataSetId: number;
  query: string;
}

const TimeseriesPreview = ({ dataSetId, query }: TimeseriesPreviewProps) => {
  const { t } = useTranslation();

  const { data: timeseries } = useQuery(
    getResourceSearchQueryKey('timeseries', dataSetId, query),
    () => sdk.timeseries.search(getResourceSearchParams(dataSetId, query)),
    {
      onError: (e: any) => {
        handleError({ message: t('fetch-timeseries-failed'), ...e });
      },
    }
  );

  const timeseriesColumns = [
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
      title: t('external-id'),
      dataIndex: 'externalId',
      key: 'externalId',
      render: (value: any) => <ColumnWrapper title={value} />,
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('asset-id'),
      dataIndex: 'assetId',
      key: 'assetId',
      render: (value: any) => <ColumnWrapper title={value} />,
    },
    {
      title: t('action_other'),
      render: (record: Timeseries) => {
        return (
          <span>
            <Link to={createLink(`/explore/timeSeries/${record.id}`)}>
              {t('view')}
            </Link>
          </span>
        );
      },
    },
  ];

  return (
    <div id="#timeseries">
      <ItemLabel>{t('time-series')}</ItemLabel>
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
