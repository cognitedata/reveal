import sdk from '@cognite/cdf-sdk-singleton';
import { Table, TableNoResults } from '@cognite/cdf-utilities';
import {
  getContainer,
  ContentView,
  handleError,
  getResourceSearchParams,
  getResourceSearchQueryKey,
} from 'utils';
import { useTranslation } from 'common/i18n';
import { useResourceTableColumns } from 'components/Data/ResourceTableColumns';
import { useQuery } from 'react-query';

interface TimeseriesPreviewProps {
  dataSetId: number;
  query: string;
}

const TimeseriesPreview = ({ dataSetId, query }: TimeseriesPreviewProps) => {
  const { t } = useTranslation();
  const { getResourceTableColumns } = useResourceTableColumns();
  const { data: timeseries, isLoading: isTimeseriesLoading } = useQuery(
    getResourceSearchQueryKey('timeseries', dataSetId, query),
    () => sdk.timeseries.search(getResourceSearchParams(dataSetId, query)),
    {
      onError: (e: any) => {
        handleError({ message: t('fetch-timeseries-failed'), ...e });
      },
    }
  );

  return (
    <ContentView id="timeseriesTableId">
      <Table
        rowKey="key"
        loading={isTimeseriesLoading}
        columns={[...getResourceTableColumns('timeseries')]}
        dataSource={timeseries || []}
        onChange={(_pagination, _filters) => {
          // TODO: Implement sorting
        }}
        getPopupContainer={getContainer}
        emptyContent={
          <TableNoResults
            title={t('no-records')}
            content={t('no-search-records', {
              $: '',
            })}
          />
        }
        appendTooltipTo={getContainer()}
      />
    </ContentView>
  );
};

export default TimeseriesPreview;
