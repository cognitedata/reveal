/*!
 * Copyright 2024 Cognite AS
 */
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { type Model3D, type CogniteClient } from '@cognite/sdk';
import { type ModelWithRevision } from './types';
import { getRevisions } from './network/getRevisions';
import { executeParallel } from '../utilities/executeParallel';
import { isDefined } from '../utilities/isDefined';

const MAX_PARALLEL_QUERIES = 2;

export function useRevisions(
  sdk: CogniteClient,
  models: Model3D[] | undefined
): UseQueryResult<ModelWithRevision[]> {
  return useQuery({
    queryKey: ['model-revision', models?.map((model) => model.id)],
    queryFn: async () => {
      if (models === undefined) return;
      const results = await executeParallel(
        models?.map((model) => async () => await getRevisions(model, sdk)),
        MAX_PARALLEL_QUERIES
      );
      return results.flat().filter(isDefined);
    },
    enabled: models !== undefined && models.length > 0
  });
}
