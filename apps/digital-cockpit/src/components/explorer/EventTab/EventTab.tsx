import { Badge, Input } from '@cognite/cogs.js';
import { CogniteEvent } from '@cognite/sdk';
import debounce from 'lodash/debounce';
import { useMemo, useState } from 'react';
import { UseQueryResult } from 'react-query';
import NoData from 'components/utils/NoData';
import Loading from 'components/utils/Loading';
import useEventSearchQuery from 'hooks/useQuery/useEventSearchQuery';

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
  const debouncedSetQuery = useMemo(() => debounce(setQuery, 300), []);

  const assetQuery = useEventSearchQuery({
    filter: {
      assetIds: [assetId],
    },
    search: {
      description: query,
    },
    limit: 10,
  });
  const relatedQuery = useEventSearchQuery({
    filter: {
      assetSubtreeIds: [{ id: assetId }],
    },
    search: {
      description: query,
    },
    limit: 10,
  });

  const renderSection = ({
    data,
    isLoading,
  }: UseQueryResult<CogniteEvent[], unknown>) => {
    if (isLoading) {
      return <Loading />;
    }
    if (!data) {
      return <NoData type="Events" />;
    }

    return (
      <TableWrapper>
        <EventRowHeader />
        {data.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </TableWrapper>
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
          On this asset <Badge text={String(assetQuery.data?.length || 0)} />
        </h3>
        {renderSection(assetQuery)}
      </section>
      <section>
        <h3>
          Related assets <Badge text={String(relatedQuery.data?.length || 0)} />
        </h3>
        {renderSection(relatedQuery)}
      </section>
    </TabWrapper>
  );
};

export default EventTab;
