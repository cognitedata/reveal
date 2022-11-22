import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { useQuery } from '@tanstack/react-query';

export const useFetchCDFResource = (
  endpoint: 'assets' | 'timeseries' | 'sequences' | 'events',
  externalId?: string
) => {
  const { client } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [client.project, 'cdf', endpoint, externalId],
    queryFn: () =>
      client[endpoint]
        .retrieve([{ externalId: externalId! }])
        .then((list) => list[0]),
    staleTime: Infinity,
    enabled: !!endpoint && !!externalId,
  });
};
