import { TableNoResults } from '@cognite/cdf-utilities';
import { Button, Flex, Icon, Table } from '@cognite/cogs.js';
import { CogniteEvent } from '@cognite/sdk/dist/src';

import { useTranslation } from '../../common/i18n';
import { ContentView, ExploreViewConfig } from '../../utils';
import { useResourceTableColumns } from '../Data/ResourceTableColumns';

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
  // eslint-disable-next-line
  setExploreView = () => {},
}: EventsPreviewProps) => {
  const { t } = useTranslation();
  const { eventColumns } = useResourceTableColumns();

  const handleViewEvents = () => {
    setExploreView({
      visible: true,
      type: 'events-profile',
      id: dataSetId,
    });
  };

  return (
    <ContentView id="eventsTableId" className="resource-table">
      <Flex justifyContent="flex-end">
        <Button type="secondary" size="small" onClick={handleViewEvents}>
          {`${t('view')} ${t('events').toLocaleLowerCase()}`}
        </Button>
      </Flex>
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
          columns={eventColumns as any}
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

export default EventsPreview;
