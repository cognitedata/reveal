/*!
 * Copyright 2024 Cognite AS
 */
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { type Model3D, type CogniteClient, type Revision3D } from '@cognite/sdk';
import { type ModelWithRevision } from './types';

const STALE_TIME = 10 * 1000;
const REFRESH_INTERVAL = 10 * 1000;
const RETRY_DELAY = (attempt: number): number =>
  Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000);

const fetchRevisions = async (
  model: Model3D | undefined,
  sdk: CogniteClient
): Promise<ModelWithRevision | undefined> => {
  if (model === undefined) return;
  const revisions = await sdk.revisions3D.list(model.id).autoPagingToArray({ limit: Infinity });
  const revisionFound =
    revisions.find((revision: Revision3D) => revision.published) ?? revisions[0];
  return {
    model,
    revision: revisionFound
  };
};

export function useRevisions(
  sdk: CogniteClient,
  models: Model3D[] | undefined
): UseQueryResult<ModelWithRevision[]> {
  return useQuery({
    queryKey: ['model-revision', models],
    queryFn: async () => {
      const fetchPromises = models?.map(async (model) => await fetchRevisions(model, sdk));
      return await Promise.all(fetchPromises ?? []);
    },
    staleTime: STALE_TIME,
    refetchInterval: REFRESH_INTERVAL,
    retryDelay: RETRY_DELAY,
    enabled: models !== undefined && models.length > 0
  });
}
