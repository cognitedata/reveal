/*!
 * Copyright 2024 Cognite AS
 */
import { type QueryRequest } from '@cognite/sdk/dist/src';
import { type FdmCadConnection, type FdmKey } from '../../components/CacheProvider/types';
import { FdmNode, NodeItem, type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import {
  COGNITE_3D_OBJECT_SOURCE,
  COGNITE_ASSET_SOURCE,
  COGNITE_CAD_NODE_SOURCE,
  CogniteAssetProperties,
  type CogniteCADNodeProperties,
  CORE_DM_3D_CONTAINER_SPACE,
  CORE_DM_SPACE
} from './dataModels';
import { cogniteObject3dSourceWithProperties } from './cogniteObject3dSourceWithProperties';
import { cogniteCadNodeSourceWithProperties } from './cogniteCadNodeSourceWithProperties';
import { getModelIdFromExternalId, getRevisionIdFromExternalId } from './getCdfIdFromExternalId';
import { toFdmKey } from '../utils/toFdmKey';
import { type PromiseType } from '../utils/typeUtils';
import { isDefined } from '../../utilities/isDefined';
import { type QueryResult } from '../utils/queryNodesAndEdges';
import { restrictToDmsId } from './restrictToDmsId';
import { cogniteAssetSourceWithProperties } from './cogniteAssetSourceWithProperties';

export async function getCadConnectionsForRevisions(
  modelRevisions: Array<[DmsUniqueIdentifier, DmsUniqueIdentifier]>,
  fdmSdk: FdmSDK
): Promise<FdmCadConnection[]> {
  const results = await getModelConnectionResults(modelRevisions, fdmSdk);
  const object3dToAssetMap = createObject3dToAssetMap(results.items.assets);
  const cadNodeToModelMap = createCadNodeToObject3dMap(results.items.cad_nodes);

  const returnResult = results.items.cad_nodes
    .map((cadNode) => {
      const props = cadNode.properties[CORE_DM_SPACE]['CogniteCADNode/v1'];
      const object3dKey = cadNodeToModelMap.get(toFdmKey(cadNode));

      if (object3dKey === undefined) {
        return undefined;
      }

      const connectedAsset = object3dToAssetMap.get(object3dKey);

      if (connectedAsset === undefined) {
        return undefined;
      }

      const modelIdRevisionIdTreeIndex = getModelAndTreeIndex(modelRevisions, props);

      if (modelIdRevisionIdTreeIndex === undefined) {
        return undefined;
      }

      return {
        ...modelIdRevisionIdTreeIndex,
        instance: restrictToDmsId(connectedAsset)
      };
    })
    .filter(isDefined);

  return returnResult;
}

function createObject3dToAssetMap<T extends NodeItem<CogniteAssetProperties>>(
  assets: T[]
): Map<FdmKey, T> {
  return new Map(
    assets.map((asset) => [
      toFdmKey(asset.properties[CORE_DM_SPACE]?.['CogniteAsset/v1'].object3D),
      asset
    ])
  );
}

function createCadNodeToObject3dMap(
  cadNodes: PromiseType<ReturnType<typeof getModelConnectionResults>>['items']['cad_nodes']
): Map<FdmKey, FdmKey> {
  return new Map(
    cadNodes.map((cadNode) => [
      toFdmKey(cadNode),
      toFdmKey(cadNode.properties.cdf_cdm['CogniteCADNode/v1'].object3D)
    ])
  );
}

function getModelAndTreeIndex(
  modelRevisions: Array<[DmsUniqueIdentifier, DmsUniqueIdentifier]>,
  cadNodeProps: CogniteCADNodeProperties
): { modelId: number; revisionId: number; treeIndex: number } | undefined {
  const modelRevisionPair = modelRevisions.find(
    ([modelRef, _revisionRef]) =>
      cadNodeProps.model3D.externalId === modelRef.externalId &&
      cadNodeProps.model3D.space === modelRef.space
  );

  if (modelRevisionPair === undefined) {
    return undefined;
  }

  const revisionIndex = cadNodeProps.revisions.findIndex(
    (propRevision) =>
      modelRevisionPair[1].externalId === propRevision.externalId &&
      modelRevisionPair[1].space === propRevision.space
  );

  if (revisionIndex === -1) {
    return undefined;
  }

  const modelId = getModelIdFromExternalId(cadNodeProps.model3D.externalId);
  const revisionId = getRevisionIdFromExternalId(cadNodeProps.revisions[revisionIndex].externalId);
  const treeIndex = cadNodeProps.treeIndexes[revisionIndex];

  return { modelId, revisionId, treeIndex };
}

type SourcesSelectType = [
  { source: typeof COGNITE_CAD_NODE_SOURCE; properties: CogniteCADNodeProperties },
  { source: typeof COGNITE_ASSET_SOURCE; properties: CogniteAssetProperties }
];

async function getModelConnectionResults(
  modelRevisions: Array<[DmsUniqueIdentifier, DmsUniqueIdentifier]>,
  fdmSdk: FdmSDK
): Promise<QueryResult<typeof cadConnectionsQuery, SourcesSelectType>> {
  const parameters = {
    modelRefs: modelRevisions.map(([modelRef, _revisionRef]) => restrictToDmsId(modelRef)),
    revisionRefs: modelRevisions.map(([_modelRef, revisionRef]) => restrictToDmsId(revisionRef))
  };

  const query = {
    ...cadConnectionsQuery,
    parameters
  };

  return await fdmSdk.queryAllNodesAndEdges<typeof query, SourcesSelectType>(query);
}

const cadConnectionsQuery = {
  with: {
    cad_nodes: {
      nodes: {
        filter: {
          and: [
            {
              in: {
                property: [
                  CORE_DM_3D_CONTAINER_SPACE,
                  COGNITE_CAD_NODE_SOURCE.externalId,
                  'model3D'
                ],
                values: { parameter: 'modelRefs' }
              }
            },
            {
              containsAny: {
                property: [
                  CORE_DM_3D_CONTAINER_SPACE,
                  COGNITE_CAD_NODE_SOURCE.externalId,
                  'revisions'
                ],
                values: { parameter: 'revisionRefs' }
              }
            }
          ]
        }
      },
      limit: 10000
    },
    object_3ds: {
      nodes: {
        from: 'cad_nodes',
        through: { view: COGNITE_CAD_NODE_SOURCE, identifier: 'object3D' },
        direction: 'outwards',
        filter: {
          hasData: [COGNITE_3D_OBJECT_SOURCE]
        }
      },
      limit: 10000
    },
    assets: {
      nodes: {
        from: 'object_3ds',
        through: { view: COGNITE_ASSET_SOURCE, identifier: 'object3D' },
        direction: 'inwards'
      },
      limit: 10000
    }
  },
  select: {
    cad_nodes: { sources: cogniteCadNodeSourceWithProperties },
    assets: { sources: cogniteAssetSourceWithProperties }
  }
} as const satisfies Omit<QueryRequest, 'cursor' | 'parameters'>;
