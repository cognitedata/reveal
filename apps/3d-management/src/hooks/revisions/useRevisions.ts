import { useQuery, useQueryCache } from 'react-query';
import sdk from '@cognite/cdf-sdk-singleton';
import { Revision3D, HttpError } from '@cognite/sdk';
import { fireErrorNotification, QUERY_KEY } from 'src/utils';

type Args = { modelId: number };

const fetchRevisions = (_key, { modelId }: Args): Promise<Revision3D[]> => {
  return sdk.revisions3D.list(modelId).autoPagingToArray({ limit: Infinity });
};

export function useRevisions(modelId: number) {
  const queryCache = useQueryCache();
  const queryKey = [QUERY_KEY.REVISIONS, { modelId }];

  return useQuery<Revision3D[], HttpError>({
    queryKey,
    refetchOnMount: false,
    queryFn: fetchRevisions,
    config: {
      initialData: () => queryCache.getQueryData(queryKey),
      onError: (error) => {
        fireErrorNotification({ error, message: 'Could not fetch revisions' });
      },
    },
  });
}
