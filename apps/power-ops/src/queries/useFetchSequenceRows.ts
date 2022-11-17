import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { useQuery } from '@tanstack/react-query';

export const useFetchSequenceRows = (externalId: string) => {
  const { client } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [client.project, 'cdf-sequence', externalId, 'rows'],
    queryFn: () =>
      client.sequences
        .retrieveRows({ externalId })
        .autoPagingToArray({ limit: Infinity }),
    staleTime: Infinity,
    enabled: !!externalId,
  });
};
