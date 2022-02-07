import { Badge, Input } from '@cognite/cogs.js';
import { CogniteEvent } from '@cognite/sdk';
import debounce from 'lodash/debounce';
import { useEffect, useMemo, useState } from 'react';
import { UseQueryResult } from 'react-query';
import NoData from 'components/utils/NoData';
import Loading from 'components/utils/Loading';
import useEventSearchQuery from 'hooks/useQuery/useEventSearchQuery';
import usePagination from 'hooks/usePagination';
import useEventAggregateQuery from 'hooks/useQuery/useEventAggregateQuery';

import EventRow from '../EventRow';
import { TableWrapper } from '../EventRow/TableWrapper';
import EventRowHeader from '../EventRow/EventRowHeader';

import { TabWrapper } from './elements';

export type EventTabProps = {
  assetId: number;
};

const EventTab = ({ assetId }: EventTabProps) => {
  // The actual value of the input field
  const [value, setValue] = useState('');
  // The field we pass to the query (so we can debounce)
  const [query, setQuery] = useState('');
  const { getPageData, renderPagination, resetPages } = usePagination();
  const debouncedSetQuery = useMemo(() => debounce(setQuery, 300), []);

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
    filter: {
      assetIds: [assetId],
    },
    search: {
      description: query,
    },
    limit: 500,
  });
  const relatedQuery = useEventSearchQuery({
    filter: {
      assetSubtreeIds: [{ id: assetId }],
    },
    search: {
      description: query,
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
      <Input
        className="search-input"
        placeholder="Search"
        icon="Search"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          debouncedSetQuery(e.target.value);
        }}
      />
      <section>
        <h3>
          On this asset{' '}
          <Badge
            text={String(
              (query ? assetQuery.data?.length : eventsOnAsset) || 0
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
              (query ? relatedQuery.data?.length : eventsUnderAsset) || 0
            )}
          />
        </h3>
        {renderSection(relatedQuery, 'relatedAssets')}
      </section>
    </TabWrapper>
  );
};

export default EventTab;
