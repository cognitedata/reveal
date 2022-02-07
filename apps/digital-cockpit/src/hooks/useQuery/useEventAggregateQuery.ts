import { useContext } from 'react';
import { useQuery } from 'react-query';
import { EventAggregateQuery } from '@cognite/sdk';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';

const useEventAggregateQuery = (eventAggregateQuery?: EventAggregateQuery) => {
  const { client } = useContext(CogniteSDKContext);

  const query = useQuery<number>(
    ['eventAggregate', eventAggregateQuery],
    () =>
      client.events.aggregate
        .count(eventAggregateQuery || {})
        .then((res) => res[0].count),
    {
      enabled: Boolean(eventAggregateQuery),
    }
  );
  return query;
};

export default useEventAggregateQuery;
