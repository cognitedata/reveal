import { Table, TableNoResults } from '@cognite/cdf-utilities';
import { Button, Flex } from '@cognite/cogs.js';
import { getContainer, ContentView, ExploreViewConfig } from 'utils';
import { useTranslation } from 'common/i18n';
import { useResourceTableColumns } from 'components/Data/ResourceTableColumns';
import { CogniteEvent } from '@cognite/sdk/dist/src';

interface EventsPreviewProps {
  dataSetId: number;
  setExploreView?: (value: ExploreViewConfig) => void;
  isLoading: boolean;
  data: CogniteEvent[] | undefined;
}

const EventsPreview = ({
  dataSetId,
  data = [],
  isLoading,
  setExploreView = () => {},
}: EventsPreviewProps) => {
  const { t } = useTranslation();
  const resourceTableColumns = useResourceTableColumns<CogniteEvent>('events');

  const handleViewEvents = () => {
    setExploreView({
      visible: true,
      type: 'events-profile',
      id: dataSetId,
    });
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

export default EventsPreview;
