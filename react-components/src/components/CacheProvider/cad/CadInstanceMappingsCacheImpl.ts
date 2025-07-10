import { type Node3D } from '@cognite/sdk';
import { isDmsInstance } from '../../../utilities/instanceIds';
import { type ThreeDModelFdmMappings } from '../../../hooks';
import { type AssetId, type FdmKey, type ModelRevisionId, type ModelRevisionKey } from '../types';
import { partition } from 'lodash';
import { createModelRevisionKey } from '../idAndKeyTranslation';
import { executeParallel } from '../../../utilities/executeParallel';
import { isDefined } from '../../../utilities/isDefined';
import { mergeMapMapValues } from '../../../utilities/map/mergeMapMapValues';
import { type ClassicCadAssetMappingCache } from './ClassicCadAssetMappingCache';
import { type FdmCadNodeCache } from './FdmCadNodeCache';
import { type DmsUniqueIdentifier } from '../../../data-providers';
import type { CadInstanceMappingsCache, CadModelMappings } from './CadInstanceMappingsCache';

export function createCadInstanceMappingsCache(
  classicCache: ClassicCadAssetMappingCache | undefined,
  dmCache: FdmCadNodeCache | undefined
): CadInstanceMappingsCache {
  return new CadInstanceMappingsCacheImpl(classicCache, dmCache);
}

/**
 * Top-level cache for all CAD <-> instance mappings, including DM, classic and hybrid
 */
class CadInstanceMappingsCacheImpl implements CadInstanceMappingsCache {
  private readonly _dmCache: FdmCadNodeCache | undefined;
  private readonly _classicCache: ClassicCadAssetMappingCache | undefined;

  constructor(
    classicCache: ClassicCadAssetMappingCache | undefined,
    dmCache: FdmCadNodeCache | undefined
  ) {
    this._dmCache = dmCache;
    this._classicCache = classicCache;
  }

  public async getMappingsForModelsAndInstances(
    instances: Array<AssetId | DmsUniqueIdentifier>,
    models: ModelRevisionId[]
  ): Promise<CadModelMappings> {
    if (models.length === 0 || instances.length === 0) {
      return new Map();
    }

    const [dmsInstances, internalIds] = partition(instances, isDmsInstance);

    const dmResults = await this._dmCache?.getMappingsForFdmInstances(dmsInstances, models);

    const dmResultMap = createPerModelDmMappingsMap(dmResults);

    const classicResultsPromiseCallbacks = models
      .map((model) => async () => {
        const nodeResult = await this._classicCache?.getNodesForAssetIds(
          model.modelId,
          model.revisionId,
          internalIds
        );

        if (nodeResult === undefined) {
          return undefined;
        }

        return [createModelRevisionKey(model.modelId, model.revisionId), nodeResult] as const;
      })
      .filter(isDefined);

    const classicResultTuples = await executeParallel(classicResultsPromiseCallbacks, 2);
    const modelsToClassicMappingsMap = new Map(classicResultTuples.filter(isDefined));

    const mergedCadMappings = mergeMapMapValues<ModelRevisionKey, FdmKey | AssetId, Node3D>([
      ...modelsToClassicMappingsMap.entries(),
      ...(dmResultMap?.entries() ?? [])
    ]);

    return mergedCadMappings;
  }
}

function createPerModelDmMappingsMap(
  dmResultList: ThreeDModelFdmMappings[] | undefined
): CadModelMappings | undefined {
  if (dmResultList === undefined) {
    return undefined;
  }

  return new Map(
    dmResultList.map(
      (modelWithMappings) =>
        [
          createModelRevisionKey(modelWithMappings.modelId, modelWithMappings.revisionId),
          modelWithMappings.mappings
        ] as const
    )
  );
}
