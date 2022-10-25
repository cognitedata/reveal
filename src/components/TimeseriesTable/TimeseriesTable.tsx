import sdk from '@cognite/cdf-sdk-singleton';
import { Table, TableNoResults } from '@cognite/cdf-utilities';
import {
  getContainer,
  ContentView,
  handleError,
  getResourceSearchParams,
  getResourceSearchQueryKey,
  ExploreDataFilters,
} from 'utils';
import { useTranslation } from 'common/i18n';
import { useResourceTableColumns } from 'components/Data/ResourceTableColumns';
import { useQuery } from 'react-query';
import { Timeseries } from '@cognite/sdk';

interface TimeseriesPreviewProps {
  dataSetId: number;
  query: string;
  filters: ExploreDataFilters;
}

const TimeseriesPreview = ({
  dataSetId,
  query,
  filters,
}: TimeseriesPreviewProps) => {
  const { t } = useTranslation();
  const resourceTableColumns =
    useResourceTableColumns<Timeseries>('timeseries');
  const { data: timeseries, isLoading: isTimeseriesLoading } = useQuery(
    getResourceSearchQueryKey('timeseries', dataSetId, query, filters),
    () =>
      sdk.timeseries.search(getResourceSearchParams(dataSetId, query, filters)),
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
        columns={resourceTableColumns}
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
