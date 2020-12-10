import { v3, v3Client } from '@cognite/cdf-sdk-singleton';
import { useQuery } from 'react-query';
import { RevisionLog3D } from 'src/utils/sdk/3dApiUtils';
import { fireErrorNotification, QUERY_KEY } from 'src/utils';
import { RevisionIds } from 'src/utils/types';

const fetchLogs = ({ modelId, revisionId }: RevisionIds) => async (): Promise<
  RevisionLog3D[]
> => {
  const {
    data: { items },
  } = await v3Client.get<{ items: RevisionLog3D[] }>(
    `api/v1/projects/${v3Client.project}/3d/models/${modelId}/revisions/${revisionId}/logs?severity=3`
  );
  return items;
};

export function useRevisionLogs(args: RevisionIds) {
  return useQuery<RevisionLog3D[], v3.HttpError>({
    queryKey: [QUERY_KEY.REVISIONS, args],
    queryFn: fetchLogs(args),
    config: {
      onError: (error) => {
        fireErrorNotification({
          error,
          message: 'Could not fetch revision logs',
        });
      },
    },
  });
}
