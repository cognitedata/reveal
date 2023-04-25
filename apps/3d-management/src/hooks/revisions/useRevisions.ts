import { useQuery, useQueryClient } from 'react-query';
import sdk from '@cognite/cdf-sdk-singleton';
import { Revision3D, HttpError } from '@cognite/sdk';
import { fireErrorNotification, QUERY_KEY } from 'utils';
import { useState } from 'react';
import { getReFetchInterval } from '../../utils/getReFetchInterval';

type Args = { modelId: number };

const fetchRevisions = ({ modelId }: Args): Promise<Revision3D[]> => {
  return sdk.revisions3D.list(modelId).autoPagingToArray({ limit: Infinity });
};

export function useRevisions(modelId: number) {
  const [startTime, _] = useState(Date.now());
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
      enabled: !!modelId,
      retryDelay: (attempt) =>
        Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000), // exponential backoff if query fails
      refetchInterval: (data: Revision3D[] | undefined) => {
        if (!data) {
          return false;
        }
        const allDone = Object.values(data).every(
          (revision) =>
            revision.status.toLowerCase() === 'done' ||
            revision.status.toLowerCase() === 'failed'
        );
        if (data?.length && allDone) {
          return false;
        }
        return getReFetchInterval(startTime);
      },
    }
  );
}
