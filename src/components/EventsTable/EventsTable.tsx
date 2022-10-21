import { Table, TableNoResults } from '@cognite/cdf-utilities';
import { createLink } from '@cognite/cdf-utilities';
import { Flex, Button } from '@cognite/cogs.js';
import ResourceProperty from 'components/Data/ResourceItem';
import { ExploreViewConfig, handleError, getContainer } from 'utils';
import { useTranslation } from 'common/i18n';
import { useSearchResource } from 'hooks/useSearchResource';

import moment from 'moment';
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

  const getEventsColumn = () => {
    return [
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'dataset-events-type',
        render: (_value: string, record: any) => (
          <ResourceProperty value={record.type} />
        ),
      },
      {
        title: 'Subtype',
        dataIndex: 'sub-type',
        key: 'dataset-events-sub-type',
        render: (_value: string, record: any) => (
          <ResourceProperty value={record.subtype} />
        ),
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'dataset-events-description',
        render: (_value: string, record: any) => (
          <ResourceProperty value={record.description} />
        ),
      },
      {
        title: 'Updated',
        dataIndex: 'last-updated-time',
        key: 'dataset-events-last-updated-time',
        render: (_value: string, record: any) => (
          <ResourceProperty
            value={moment(record.lastUpdatedTime).format('DD/MM/YYYY')}
          />
        ),
      },
      {
        title: 'Created',
        dataIndex: 'created-time',
        key: 'dataset-events-created-time',
        render: (_value: string, record: any) => (
          <ResourceProperty
            value={moment(record.createdTime).format('DD/MM/YYYY')}
          />
        ),
      },
      {
        title: 'Id',
        dataIndex: 'id',
        key: 'dataset-events-id',
        render: (_value: string, record: any) => (
          <ResourceProperty
            value={record.id}
            isLink
            redirectURL={createLink(`/explore/event/${record.id}`)}
          />
        ),
      },
    ];
  };

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
    <div id="eventsTableId">
      <Flex justifyContent="flex-end" style={{ paddingTop: 24 }}>
        <Button type="secondary" size="small" onClick={handleViewEvents}>
          {`${t('view')} ${t('events').toLocaleLowerCase()}`}
        </Button>
      </Flex>
      <Table
        rowKey="key"
        loading={isEventsLoading}
        columns={[...getEventsColumn()]}
        dataSource={events || []}
        onChange={(_pagination, _filters) => {
          // sorter
          // TODO: Implement sorting
        }}
        getPopupContainer={getContainer}
        emptyContent={
          <TableNoResults
            title={t('data-set-list-no-records')}
            content={t('data-set-list-search-not-found', {
              $: '',
            })}
          />
        }
        appendTooltipTo={getContainer()}
      />
    </div>
  );
};

export default EventsPreview;
