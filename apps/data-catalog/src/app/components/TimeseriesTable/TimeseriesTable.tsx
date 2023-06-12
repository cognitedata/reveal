import { TableNoResults } from '@cognite/cdf-utilities';
import { ContentView } from 'utils';
import { useTranslation } from 'common/i18n';
import { useResourceTableColumns } from 'components/Data/ResourceTableColumns';
import { Timeseries } from '@cognite/sdk';
import { Icon, Table } from '@cognite/cogs.js';

interface TimeseriesPreviewProps {
  data: Timeseries[] | undefined;
  isLoading: boolean;
}

const TimeseriesPreview = ({
  data = [],
  isLoading,
}: TimeseriesPreviewProps) => {
  const { t } = useTranslation();
  const { timeseriesColumns } = useResourceTableColumns();

  return (
    <ContentView
      id="timeseriesTableId"
      className="resource-table dataset-timeseries-table"
    >
      {isLoading ? (
        <div className="loader-wrapper">
          <Icon type="Loader" size={32} />
        </div>
      ) : (
        <Table
          rowKey={(d) => String(d.id)}
          // The types are interfaces instead of type, can't get them to work
          // with the types defined in the library. The components worked and
          // still work fine, therefore I think it's safe to provide any.
          columns={timeseriesColumns as any}
          dataSource={data as any}
          locale={{
            emptyText: (
              <TableNoResults
                title={t('no-records')}
                content={t('no-search-records', {
                  $: '',
                })}
              />
            ),
          }}
        />
      )}
    </ContentView>
  );
};

export default TimeseriesPreview;
