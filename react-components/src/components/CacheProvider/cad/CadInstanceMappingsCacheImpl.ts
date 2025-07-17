import { type Node3D } from '@cognite/sdk';
import { type InstanceId, type InstanceKey, isDmsInstance } from '../../../utilities/instanceIds';
import { type ThreeDModelFdmMappings } from '../../../hooks';
import {
  type CadNodeTreeData,
  type FdmKey,
  type ModelRevisionId,
  type ModelRevisionKey
} from '../types';
import { partition } from 'lodash';
import { createFdmKey, createModelRevisionKey } from '../idAndKeyTranslation';
import { executeParallel } from '../../../utilities/executeParallel';
import { isDefined } from '../../../utilities/isDefined';
import { mergeMapMapValues } from '../../../utilities/map/mergeMapMapValues';
import { type ClassicCadAssetMappingCache } from './ClassicCadAssetMappingCache';
import { type FdmCadNodeCache } from './FdmCadNodeCache';
import type {
  CadInstanceMappingsCache,
  CadModelMappingsWithNodes,
  CadModelTreeIndexMappings
} from './CadInstanceMappingsCache';
import { concatenateMapValues } from '../../../utilities/map/concatenateMapValues';
import { MAX_PARALLEL_QUERIES } from '../../../data-providers/utils/getDMSModelRevisionRefs';
import { isClassicCadAssetTreeIndexMapping } from './assetMappingTypes';

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
    instances: InstanceId[],
    models: ModelRevisionId[]
  ): Promise<CadModelMappingsWithNodes> {
    if (models.length === 0 || instances.length === 0) {
      return new Map();
    }

    const [dmsInstances, internalIds] = partition(instances, isDmsInstance);

    const dmResults = await this._dmCache?.getMappingsForFdmInstances(dmsInstances, models);

    const dmResultMap = createPerModelDmMappingsMap(dmResults);

    const classicResultsPromiseCallbacks = models
      .map((model) => async () => {
        const nodeResult = await this._classicCache?.getNodesForInstanceIds(
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

    const classicResultTuples = await executeParallel(
      classicResultsPromiseCallbacks,
      MAX_PARALLEL_QUERIES
    );
    const modelsToClassicMappingsMap = new Map(classicResultTuples.filter(isDefined));

    const mergedCadMappings = mergeMapMapValues<ModelRevisionKey, InstanceKey, Node3D>([
      ...modelsToClassicMappingsMap.entries(),
      ...(dmResultMap?.entries() ?? [])
    ]);

    return mergedCadMappings;
  }

  public async getAllModelMappings(models: ModelRevisionId[]): Promise<CadModelTreeIndexMappings> {
    const classicResultsPromise = executeParallel(
      models.map((model) => async () => {
        if (this._classicCache === undefined) {
          return undefined;
        }
        return {
          model,
          mappings: await this._classicCache.getAssetMappingsForModel(
            model.modelId,
            model.revisionId
          )
        };
      }),
      MAX_PARALLEL_QUERIES
    );

    const dmResultsPromise = this._dmCache?.getAllMappingExternalIds(models, true);

    // Let queries run in parallel
    const classicResultsWithModel = (await classicResultsPromise).filter(isDefined).flat();
    const dmResultsWithModel = await dmResultsPromise;

    const classicResultsMap = new Map(
      classicResultsWithModel.map(({ model, mappings }) => {
        const mappingsMap = concatenateMapValues(
          mappings.map((mapping): [InstanceKey, CadNodeTreeData] => {
            if (isClassicCadAssetTreeIndexMapping(mapping)) {
              const { assetId, ...nodeIdData } = mapping;
              return [assetId, nodeIdData];
            } else {
              const { instanceId, ...nodeIdData } = mapping;
              return [createFdmKey(instanceId), nodeIdData];
            }
          })
        );
        return [createModelRevisionKey(model.modelId, model.revisionId), mappingsMap];
      })
    );

    const dmModelToInstanceToNodeMap = new Map(
      [...(dmResultsWithModel?.entries() ?? [])].map(([modelKey, fdmConnections]) => {
        const connectionMapEntries: Array<[FdmKey, CadNodeTreeData]> = fdmConnections.map(
          (connection) => [
            createFdmKey(connection.connection.instance),
            {
              treeIndex: connection.cadNode.treeIndex,
              subtreeSize: connection.cadNode.subtreeSize
            }
          ]
        );
        return [modelKey, concatenateMapValues(connectionMapEntries)];
      })
    );

    return mergeMapMapValues<ModelRevisionKey, InstanceKey, CadNodeTreeData>([
      ...classicResultsMap.entries(),
      ...dmModelToInstanceToNodeMap.entries()
    ]);
  }
}

function createPerModelDmMappingsMap(
  dmResultList: ThreeDModelFdmMappings[] | undefined
): CadModelMappingsWithNodes | undefined {
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
