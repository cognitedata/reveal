import { useQuery } from 'react-query';
import { CogniteEvent, EventSearchRequest } from '@cognite/sdk';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';

const useEventSearchQuery = (searchQuery: EventSearchRequest) => {
  const { client } = useCDFExplorerContext();

  const query = useQuery<CogniteEvent[]>(
    ['eventsQuery', searchQuery],
    () => client.events.search(searchQuery),
    {
      enabled: Boolean(searchQuery),
    }
  );
  return query;
};

export default useEventSearchQuery;
