import type { FilterDefinition, ViewDefinition, CogniteClient } from '@cognite/sdk';
import { chunk } from 'lodash';
import { createFdmKey } from '../../../components/CacheProvider/idAndKeyTranslation';
import type { ModelRevisionId, FdmKey } from '../../../components/CacheProvider/types';
import type { NodeItem } from '../../../data-providers';
import { FdmSDK } from '../../../data-providers/FdmSDK';
import { isDefined } from '../../../utilities/isDefined';
import { restrictToViewReference } from '../../../utilities/restrictToViewReference';
import { type PointCloudAnnotationCache } from '../../../components/CacheProvider/PointCloudAnnotationCache';
import { InstanceReferenceKey } from '../../../utilities/instanceIds';

const MODELS_CHUNK_SIZE = 10;

export async function searchHybridDmPointCloudAssetMappingsWithFilters(
  models: ModelRevisionId[],
  view: ViewDefinition,
  options: { query?: string; filter?: FilterDefinition; limit?: number },
  sdk: CogniteClient,
  assetMappingAndAnnotationCache: PointCloudAnnotationCache
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

  const instanceKeyToInstanceMap = new Map<InstanceReferenceKey, NodeItem>(
    searchResult.instances.map(
      (instance) => [createFdmKey(instance), instance] as [FdmKey, NodeItem]
    )
  );

  const mappedInstances = new Map<FdmKey, NodeItem>();

  for (const modelsChunk of chunk(models, MODELS_CHUNK_SIZE)) {
    const modelMappingPromises = modelsChunk.map(
      async (model) =>
        await assetMappingAndAnnotationCache.getPointCloudAnnotationsForInstanceIds(
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

    relevantInstancesForChunk.forEach((instance) => {
      mappedInstances.set(createFdmKey(instance), instance);
    });
  }

  return Array.from(mappedInstances.values());
}
