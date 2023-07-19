import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { getProject } from '@cognite/cdf-utilities';
import { HttpError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { fireErrorNotification, QUERY_KEY } from '../../utils';
import { getOrganizedRevisionLogs } from '../../utils/getOrganizedRevisionLogs';
import { getReFetchInterval } from '../../utils/getReFetchInterval';
import { RevisionLog3D } from '../../utils/sdk/3dApiUtils';
import { RevisionIds } from '../../utils/types';

export function useRevisionLogs(args: RevisionIds) {
  const [startTime, _] = useState(Date.now());
  const sdk = useSDK();
  const fetchLogs =
    ({ modelId, revisionId }: RevisionIds) =>
    async (): Promise<RevisionLog3D[]> => {
      const {
        data: { items },
      } = await sdk.get<{ items: RevisionLog3D[] }>(
        `api/v1/projects/${getProject()}/3d/models/${modelId}/revisions/${revisionId}/logs?severity=3`
      );
      return items;
    };

  return useQuery<RevisionLog3D[], HttpError>(
    QUERY_KEY.REVISIONS(args),
    fetchLogs(args),
    {
      refetchOnMount: true,
      onError: (error) => {
        fireErrorNotification({
          error,
          message: 'Could not fetch revision logs',
        });
      },
      enabled: !!args.revisionId && !!args.modelId,
      retryDelay: (attempt) =>
        Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000), // exponential backoff if query fails
      refetchInterval: (data: RevisionLog3D[] | undefined) => {
        if (!data) {
          return false;
        }
        const organizedRevisionLogs = getOrganizedRevisionLogs(data);
        const processCompleted = Object.values(organizedRevisionLogs).every(
          (revisionLogCategory) =>
            revisionLogCategory.some(
              (revisionLog) =>
                revisionLog.type.toLowerCase() === 'success' ||
                revisionLog.type.toLowerCase() === 'failure'
            )
        );
        if (data?.length && processCompleted) {
          return false;
        }
        return getReFetchInterval(startTime);
      },
    }
  );
}
