/*!
 * Copyright 2024 Cognite AS
 */
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { type Model3D, type CogniteClient } from '@cognite/sdk';
import { type ModelWithRevision } from './types';
import { getRevisions } from './network/getRevisions';

const STALE_TIME = 10 * 1000;
const REFRESH_INTERVAL = 10 * 1000;

export function useRevisions(
  sdk: CogniteClient,
  models: Model3D[] | undefined
): UseQueryResult<ModelWithRevision[]> {
  return useQuery({
    queryKey: ['model-revision', models],
    queryFn: async () => {
      const fetchPromises = models?.map(async (model) => await getRevisions(model, sdk));
      return await Promise.all(fetchPromises ?? []);
    },
    staleTime: STALE_TIME,
    refetchInterval: REFRESH_INTERVAL,
    enabled: models !== undefined && models.length > 0
  });
}
