import { Badge } from '@cognite/cogs.js';
import { CogniteEvent, EventSearchRequest } from '@cognite/sdk';
import debounce from 'lodash/debounce';
import { useEffect, useMemo, useState } from 'react';
import { UseQueryResult } from 'react-query';
import NoData from 'components/utils/NoData';
import Loading from 'components/utils/Loading';
import useEventSearchQuery from 'hooks/useQuery/useEventSearchQuery';
import usePagination from 'hooks/usePagination';
import useEventAggregateQuery from 'hooks/useQuery/useEventAggregateQuery';
import { mapFiltersToCDF } from 'components/search/utils';
import { InternalFilterSettings } from 'components/search/types';
import SearchBar from 'components/search/SearchBar';

import EventRow from '../EventRow';
import { TableWrapper } from '../EventRow/TableWrapper';
import EventRowHeader from '../EventRow/EventRowHeader';
import EventSidebar from '../EventSidebar';

import { TabWrapper } from './elements';
import { EVENT_FILTER_SELECTORS } from './consts';

export type EventTabProps = {
  assetId: number;
};

const EventTab = ({ assetId }: EventTabProps) => {
  // The actual value of the input field
  const [filterValue, setFilterValue] = useState<InternalFilterSettings>({
    query: '',
    filters: [],
  });
  // The field we pass to the query (so we can debounce)
  const [filterQuery, setFilterQuery] = useState<EventSearchRequest>();
  const debouncedSetFilterQuery = useMemo(
    () =>
      debounce((query: InternalFilterSettings) => {
        setFilterQuery(mapFiltersToCDF(query, 'description'));
      }, 300),
    []
  );
  const { getPageData, renderPagination, resetPages } = usePagination();

  const [selectedEvent, setSelectedEvent] = useState<CogniteEvent | null>(null);
  const [selectedRelativeEvent, setSelectedRelativeEvent] =
    useState<CogniteEvent | null>(null);

  const { data: eventsOnAsset } = useEventAggregateQuery({
    filter: {
      assetIds: [assetId],
    },
  });
  const { data: eventsUnderAsset } = useEventAggregateQuery({
    filter: {
      assetSubtreeIds: [{ id: assetId }],
    },
  });

  const assetQuery = useEventSearchQuery({
    ...filterQuery,
    filter: {
      ...filterQuery?.filter,
      assetIds: [assetId],
    },
    limit: 500,
  });
  const relatedQuery = useEventSearchQuery({
    ...filterQuery,
    filter: {
      ...filterQuery?.filter,
      assetSubtreeIds: [{ id: assetId }],
    },
    limit: 500,
  });

  useEffect(() => {
    resetPages();
    setSelectedEvent(null);
    setSelectedRelativeEvent(null);
  }, [relatedQuery.data, assetQuery.data]);

  const renderSection = (
    { data, isLoading }: UseQueryResult<CogniteEvent[], unknown>,
    name: string
  ) => {
    if (isLoading) {
      return <Loading />;
    }
    if (!data || data.length === 0) {
      return <NoData type="Events" />;
    }

    return (
      <div style={{ width: '100%' }}>
        <TableWrapper>
          <EventRowHeader />
          {getPageData(data, name).map((event) => (
            <EventRow
              key={event.id}
              event={event}
              onClick={() => setSelectedEvent(event)}
              className={selectedEvent?.id === event.id ? 'selected' : ''}
            />
          ))}
        </TableWrapper>
        {renderPagination({ name, total: data.length })}
      </div>
    );
  };
  return (
    <TabWrapper style={{ paddingRight: selectedEvent ? 280 : 0 }}>
      <SearchBar
        value={filterValue}
        onChange={(next) => {
          setFilterValue(next);
          debouncedSetFilterQuery(next);
        }}
        selectors={EVENT_FILTER_SELECTORS}
      />
      <div>
        <section>
          <h3>
            On this asset{' '}
            <Badge
              text={String(
                (filterQuery ? assetQuery.data?.length : eventsOnAsset) || 0
              )}
            />
          </h3>
          <div className="event-content-section">
            {renderSection(assetQuery, 'thisAsset')}
          </div>
        </section>
        <section>
          <h3>
            Related events{' '}
            <Badge
              text={String(
                (filterQuery ? relatedQuery.data?.length : eventsUnderAsset) ||
                  0
              )}
            />
          </h3>
          <div className="event-content-section">
            {renderSection(relatedQuery, 'relatedAssets')}
          </div>
        </section>
      </div>
      {selectedEvent && (
        <div className="event-sidebar-section">
          <EventSidebar event={selectedEvent} />{' '}
        </div>
      )}
    </TabWrapper>
  );
};

export default EventTab;
