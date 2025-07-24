import type { FilterDefinition, ViewDefinition, CogniteClient } from '@cognite/sdk';
import { chunk } from 'lodash';
import { createFdmKey } from '../../../components/CacheProvider';
import type { ClassicCadAssetMappingCache } from '../../../components/CacheProvider/cad/ClassicCadAssetMappingCache';
import type { ModelRevisionId, FdmKey } from '../../../components/CacheProvider/types';
import type { NodeItem } from '../../../data-providers';
import { FdmSDK } from '../../../data-providers/FdmSDK';
import type { InstanceKey } from '../../../utilities/instanceIds';
import { isDefined } from '../../../utilities/isDefined';
import { restrictToViewReference } from '../../../utilities/restrictToViewReference';

const MODELS_CHUNK_SIZE = 10;

export async function searchHybridDmCadAssetMappingsWithFilters(
  models: ModelRevisionId[],
  options: { query?: string; filter?: FilterDefinition; limit?: number },
  view: ViewDefinition,
  sdk: CogniteClient,
  assetMappingAndNode3dCache: ClassicCadAssetMappingCache
): Promise<NodeItem[]> {
  if (models.length === 0) {
    return [];
  }

  const fdmSdk = new FdmSDK(sdk);
  const searchResult = await fdmSdk.searchInstances(
    restrictToViewReference(view),
    options.query ?? '',
    'node',
    options.limit,
    options.filter
  );

  const instanceKeyToInstanceMap = new Map<InstanceKey, NodeItem>(
    searchResult.instances.map(
      (instance) => [createFdmKey(instance), instance] as [FdmKey, NodeItem]
    )
  );

  const mappedInstances: NodeItem[] = [];

  for (const modelsChunk of chunk(models, MODELS_CHUNK_SIZE)) {
    const modelMappingPromises = modelsChunk.map(
      async (model) =>
        await assetMappingAndNode3dCache.getNodesForInstanceIds(
          model.modelId,
          model.revisionId,
          searchResult.instances
        )
    );

    const modelMappings = await Promise.all(modelMappingPromises);

    const uniqueMappedInstanceKeys = new Set(
      modelMappings.flatMap((instanceMapForModel) => [...instanceMapForModel.keys()])
    );

    const relevantInstancesForChunk = [...uniqueMappedInstanceKeys]
      .map((instanceKey) => instanceKeyToInstanceMap.get(instanceKey))
      .filter(isDefined);

    mappedInstances.push(...relevantInstancesForChunk);
  }

  return mappedInstances;
}
