import sdk from '@cognite/cdf-sdk-singleton';
import { useQuery } from 'react-query';
import { RevisionLog3D } from 'src/utils/sdk/3dApiUtils';
import { fireErrorNotification, QUERY_KEY } from 'src/utils';
import { RevisionIds } from 'src/utils/types';
import { HttpError } from '@cognite/sdk';

const fetchLogs = ({ modelId, revisionId }: RevisionIds) => async (): Promise<
  RevisionLog3D[]
> => {
  const {
    data: { items },
  } = await sdk.get<{ items: RevisionLog3D[] }>(
    `api/v1/projects/${sdk.project}/3d/models/${modelId}/revisions/${revisionId}/logs?severity=3`
  );
  return items;
};

export function useRevisionLogs(args: RevisionIds) {
  return useQuery<RevisionLog3D[], HttpError>(
    [QUERY_KEY.REVISIONS, args],
    fetchLogs(args),
    {
      onError: (error) => {
        fireErrorNotification({
          error,
          message: 'Could not fetch revision logs',
        });
      },
    }
  );
}
