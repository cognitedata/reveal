import { useQuery, useQueryClient } from 'react-query';
import sdk from '@cognite/cdf-sdk-singleton';
import { Revision3D, HttpError } from '@cognite/sdk';
import { fireErrorNotification, QUERY_KEY } from 'src/utils';

type Args = { modelId: number };

const fetchRevisions = ({ modelId }: Args): Promise<Revision3D[]> => {
  return sdk.revisions3D.list(modelId).autoPagingToArray({ limit: Infinity });
};

export function useRevisions(modelId: number) {
  const queryClient = useQueryClient();
  const queryKey = [QUERY_KEY.REVISIONS, { modelId }];

  return useQuery<Revision3D[], HttpError>(
    queryKey,
    () => fetchRevisions({ modelId }),
    {
      refetchOnMount: false,
      initialData: () => queryClient.getQueryData(queryKey),
      onError: (error) => {
        fireErrorNotification({ error, message: 'Could not fetch revisions' });
      },
    }
  );
}
