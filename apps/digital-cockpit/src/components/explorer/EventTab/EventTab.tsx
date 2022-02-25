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
      <>
        <TableWrapper>
          <EventRowHeader />
          {getPageData(data, name).map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </TableWrapper>
        {renderPagination({ name, total: data.length })}
      </>
    );
  };
  return (
    <TabWrapper>
      <SearchBar
        value={filterValue}
        onChange={(next) => {
          setFilterValue(next);
          debouncedSetFilterQuery(next);
        }}
        selectors={EVENT_FILTER_SELECTORS}
      />
      <section>
        <h3>
          On this asset{' '}
          <Badge
            text={String(
              (filterQuery ? assetQuery.data?.length : eventsOnAsset) || 0
            )}
          />
        </h3>
        {renderSection(assetQuery, 'thisAsset')}
      </section>
      <section>
        <h3>
          Related events{' '}
          <Badge
            text={String(
              (filterQuery ? relatedQuery.data?.length : eventsUnderAsset) || 0
            )}
          />
        </h3>
        {renderSection(relatedQuery, 'relatedAssets')}
      </section>
    </TabWrapper>
  );
};

export default EventTab;
