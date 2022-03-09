import { useQuery } from 'react-query';
import { EventAggregateQuery } from '@cognite/sdk';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';

const useEventAggregateQuery = (eventAggregateQuery?: EventAggregateQuery) => {
  const { client } = useCDFExplorerContext();

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
