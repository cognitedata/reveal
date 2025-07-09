import { type CogniteClient, type Node3D } from '@cognite/sdk';
import {
  type InstanceReference,
  isDmsInstance,
  isInternalId
} from '../../../utilities/instanceIds';
import { type ThreeDModelFdmMappings } from '../../../hooks';
import { type AssetId, type FdmKey, type ModelRevisionId, type ModelRevisionKey } from '../types';
import { partition } from 'lodash';
import { createModelRevisionKey } from '../idAndKeyTranslation';
import { executeParallel } from '../../../utilities/executeParallel';
import { isDefined } from '../../../utilities/isDefined';
import { mergeMapValues } from '../../../utilities/map/concatenateMapValues';
import { type ClassicCadAssetMappingCache } from './ClassicCadAssetMappingCache';
import { type FdmCadNodeCache } from './FdmCadNodeCache';

export type DmModelMappings = Map<ModelRevisionKey, Map<FdmKey, Node3D[]>>;

export type CadModelMappings = Map<ModelRevisionKey, Map<FdmKey | AssetId, Node3D[]>>;

/**
 * Top-level cache for all CAD <-> instance mappings, including DM, classic and hybrid
 */
export class CadInstanceMappingsCache {
  private readonly _dmCache: FdmCadNodeCache | undefined;
  private readonly _classicCache: ClassicCadAssetMappingCache;

  constructor(classicCache: ClassicCadAssetMappingCache, dmCache: FdmCadNodeCache | undefined) {
    this._dmCache = dmCache;
    this._classicCache = classicCache;
  }

  public async getMappingsForModelsAndInstances(
    instances: InstanceReference[],
    models: ModelRevisionId[]
  ): Promise<CadModelMappings> {
    const [dmsInstances, classicInstances] = partition(instances, isDmsInstance);

    const dmResults = await this._dmCache?.getMappingsForFdmInstances(dmsInstances, models);

    const dmResultMap = createPerModelDmMappingsMap(dmResults);

    const classicResultsPromiseCallbacks = models.map((model) => async () => {
      // TODO: create cache for internal/external ID translation
      const internalIds = classicInstances.filter(isInternalId).map((id) => id.id);
      const nodeResult = await this._classicCache.getNodesForAssetIds(
        model.modelId,
        model.revisionId,
        internalIds
      );

      return [createModelRevisionKey(model.modelId, model.revisionId), nodeResult] as const;
    });
    const classicResultTuples = await executeParallel(classicResultsPromiseCallbacks, 2);
    const modelsToClassicMappingsMap = new Map(classicResultTuples.filter(isDefined));

    const mergedCadMappings = mergeMapValues<ModelRevisionKey, FdmKey | AssetId, Node3D>([
      ...modelsToClassicMappingsMap.entries(),
      ...(dmResultMap?.entries() ?? [])
    ]);

    return mergedCadMappings;
  }
}

function createPerModelDmMappingsMap(
  dmResultList: ThreeDModelFdmMappings[] | undefined
): DmModelMappings | undefined {
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
