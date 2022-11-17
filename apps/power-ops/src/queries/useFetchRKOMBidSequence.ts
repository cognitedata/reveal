import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { Sequence } from '@cognite/sdk';
import { useQuery } from '@tanstack/react-query';

interface RKOMBidSequence extends Sequence {
  metadata: Sequence['metadata'] & {
    'bid:unit_volume': string;
    'bid:unit_price': string;
  };
}

export const useFetchRKOMBidSequence = (externalId: string) => {
  const { client } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [client.project, 'cdf-sequence', externalId],
    queryFn: () =>
      client.sequences
        .retrieve([{ externalId }])
        .then((list) => list[0] as RKOMBidSequence),
    staleTime: Infinity,
    enabled: !!externalId,
  });
};
