import { useContext } from 'react';
import { useQuery } from 'react-query';
import { CogniteEvent, EventSearchRequest } from '@cognite/sdk';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';

const useEventSearchQuery = (searchQuery: EventSearchRequest) => {
  const { client } = useContext(CogniteSDKContext);

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
