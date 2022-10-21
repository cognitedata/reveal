import { Table, TableNoResults } from '@cognite/cdf-utilities';
import { Flex, Button } from '@cognite/cogs.js';
import {
  ExploreViewConfig,
  handleError,
  getContainer,
  ContentView,
} from 'utils';
import { useTranslation } from 'common/i18n';
import { useSearchResource } from 'hooks/useSearchResource';
import { useResourceTableColumns } from 'components/Data/ResourceTableColumns';
interface EventsPreviewProps {
  dataSetId: number;
  setExploreView?: (value: ExploreViewConfig) => void;
  query: string;
}

const EventsPreview = ({
  dataSetId,
  setExploreView,
  query,
}: EventsPreviewProps) => {
  const { t } = useTranslation();
  const { getResourceTableColumns } = useResourceTableColumns();
  const { data: events, isLoading: isEventsLoading } = useSearchResource(
    'events',
    dataSetId,
    query,
    {
      onError: (e: any) => {
        handleError({ message: t('fetch-events-failed'), ...e });
      },
    }
  );

  const handleViewEvents = () => {
    if (setExploreView && dataSetId) {
      setExploreView({
        visible: true,
        type: 'events-profile',
        id: dataSetId,
      });
    }
  };

  return (
    <ContentView id="eventsTableId">
      <Flex justifyContent="flex-end">
        <Button type="secondary" size="small" onClick={handleViewEvents}>
          {`${t('view')} ${t('events').toLocaleLowerCase()}`}
        </Button>
      </Flex>
      <Table
        rowKey="key"
        loading={isEventsLoading}
        columns={[...getResourceTableColumns('events')]}
        dataSource={events || []}
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

export default EventsPreview;
