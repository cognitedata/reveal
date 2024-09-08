/*!
 * Copyright 2024 Cognite AS
 */
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { type Model3D, type CogniteClient, type Revision3D } from '@cognite/sdk';
import { type ModelWithRevision } from './types';

const fetchRevisions = async (
  model: Model3D | undefined,
  sdk: CogniteClient
): Promise<ModelWithRevision> => {
  if (model === undefined) {
    return await Promise.resolve({
      model: undefined,
      revision: undefined
    });
  }
  const revisions = await sdk.revisions3D.list(model.id).autoPagingToArray({ limit: Infinity });
  return {
    model,
    revision: revisions.find((revision: Revision3D) => revision.published) ?? revisions[0]
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
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    retryDelay: (attempt) => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000),
    enabled: models !== undefined && models.length > 0
  });
}
