import sdk from '@cognite/cdf-sdk-singleton';
import { Table, TableNoResults } from '@cognite/cdf-utilities';
import { Button, Flex } from '@cognite/cogs.js';
import {
  getContainer,
  ContentView,
  handleError,
  getResourceSearchParams,
  getResourceSearchQueryKey,
  ExploreViewConfig,
  ExploreDataFilters,
} from 'utils';
import { useTranslation } from 'common/i18n';
import { useResourceTableColumns } from 'components/Data/ResourceTableColumns';
import { useQuery } from 'react-query';
import { CogniteEvent } from '@cognite/sdk/dist/src';

interface EventsPreviewProps {
  dataSetId: number;
  setExploreView?: (value: ExploreViewConfig) => void;
  query: string;
  filters: ExploreDataFilters;
}

const EventsPreview = ({
  dataSetId,
  setExploreView,
  query,
  filters,
}: EventsPreviewProps) => {
  const { t } = useTranslation();
  const resourceTableColumns = useResourceTableColumns<CogniteEvent>('events');
  const { data: events, isLoading: isEventsLoading } = useQuery(
    getResourceSearchQueryKey('events', dataSetId, query, filters),
    () =>
      sdk.events.search(
        getResourceSearchParams(dataSetId, query, filters, 'description')
      ),
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
        columns={resourceTableColumns}
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
