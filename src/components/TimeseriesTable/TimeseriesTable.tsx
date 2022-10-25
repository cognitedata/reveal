import { Table, TableNoResults } from '@cognite/cdf-utilities';
import { getContainer, ContentView } from 'utils';
import { useTranslation } from 'common/i18n';
import { useResourceTableColumns } from 'components/Data/ResourceTableColumns';
import { Timeseries } from '@cognite/sdk';

interface TimeseriesPreviewProps {
  data: Timeseries[] | undefined;
  isLoading: boolean;
}

const TimeseriesPreview = ({
  data = [],
  isLoading,
}: TimeseriesPreviewProps) => {
  const { t } = useTranslation();
  const resourceTableColumns =
    useResourceTableColumns<Timeseries>('timeseries');

  return (
    <ContentView id="timeseriesTableId">
      <Table
        rowKey="key"
        loading={isLoading}
        columns={resourceTableColumns}
        dataSource={data}
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
