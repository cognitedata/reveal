import { Table, TableNoResults } from '@cognite/cdf-utilities';
import { getContainer, ContentView } from 'utils';
import { useTranslation } from 'common/i18n';
import { useSearchResource } from 'hooks/useSearchResource';
import { useResourceTableColumns } from 'components/Data/ResourceTableColumns';

interface TimeseriesPreviewProps {
  dataSetId: number;
  query: string;
}

const TimeseriesPreview = ({ dataSetId, query }: TimeseriesPreviewProps) => {
  const { t } = useTranslation();
  const { getResourceTableColumns } = useResourceTableColumns();
  const { data: timeseries, isLoading: isTimeseriesLoading } =
    useSearchResource('timeseries', dataSetId, query);

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
