/*!
 * Copyright 2024 Cognite AS
 */
import { type Node3D, type QueryRequest } from '@cognite/sdk';
import { type FdmCadConnection, type FdmKey } from '../../components/CacheProvider/types';
import { type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import {
  type Cognite3DObjectProperties,
  COGNITE_3D_OBJECT_SOURCE,
  type COGNITE_ASSET_SOURCE,
  COGNITE_CAD_NODE_SOURCE,
  type CogniteAssetProperties,
  type CogniteCADNodeProperties,
  CORE_DM_3D_CONTAINER_SPACE,
  CORE_DM_SPACE
} from './dataModels';
import { getModelIdFromExternalId } from './getCdfIdFromExternalId';
import { toFdmKey } from '../utils/toFdmKey';

export async function getFdmConnectionsForNodes(
  model: DmsUniqueIdentifier,
  revisionRef: DmsUniqueIdentifier,
  revisionId: number,
  nodes: Node3D[],
  fdmSdk: FdmSDK
): Promise<FdmCadConnection[]> {
  const treeIndexes = nodes.map((node) => node.treeIndex);
  const treeIndexSet = new Set(treeIndexes);

  const relevantCadNodeRefToObject3dRef = new Map<FdmKey, FdmKey>();
  const treeIndexToCadNodeMap = new Map<number, FdmKey>();

  const query = {
    ...cadConnectionQuery,
    parameters: { modelReference: model, treeIndexes, revisionRef }
  };

  const modelId = getModelIdFromExternalId(model.externalId);

  const result = await fdmSdk.queryNodesAndEdges<
    typeof query,
    [
      { source: typeof COGNITE_ASSET_SOURCE; properties: CogniteAssetProperties },
      { source: typeof COGNITE_CAD_NODE_SOURCE; properties: CogniteCADNodeProperties },
      { source: typeof COGNITE_3D_OBJECT_SOURCE; properties: Cognite3DObjectProperties }
    ]
  >(query);

  result.items.cad_nodes.forEach((cadNode) => {
    const props = cadNode.properties[CORE_DM_SPACE]['CogniteCADNode/v1'];
    const revisionIndex = props.revisions.findIndex((id) => id === revisionRef);

    const treeIndex = props.treeIndexes[revisionIndex];
    const relevant = treeIndexSet.has(treeIndex);

    if (relevant) {
      relevantCadNodeRefToObject3dRef.set(toFdmKey(cadNode), toFdmKey(props.object3D));
      treeIndexToCadNodeMap.set(treeIndex, toFdmKey(cadNode));
    }
  });

  const relevantObjects3D = result.items.objects_3d.filter((object3D) => {
    return object3D.properties[CORE_DM_SPACE]['Cognite3DObject/v1'].cadNodes.some((cadNodeId) =>
      relevantCadNodeRefToObject3dRef.has(toFdmKey(cadNodeId))
    );
  });

  const relevantObjectToAssetsMap = new Map<FdmKey, DmsUniqueIdentifier[]>(
    relevantObjects3D.map((obj) => [
      toFdmKey(obj),
      obj.properties[CORE_DM_SPACE]['Cognite3DObject/v1'].asset
    ])
  );

  const connections = new Array<FdmCadConnection>();

  [...treeIndexToCadNodeMap.entries()].forEach(([treeIndex, nodeRefKey]) => {
    const object3dKey = relevantCadNodeRefToObject3dRef.get(nodeRefKey);
    if (object3dKey === undefined) {
      // Should not happen
      return;
    }
    const assets = relevantObjectToAssetsMap.get(object3dKey);

    if (assets === undefined) {
      // Should not happen
      return;
    }

    assets.forEach((asset) =>
      connections.push({ modelId, revisionId, treeIndex, instance: asset })
    );
  });

  return connections;
}

const cadConnectionQuery = {
  with: {
    cad_nodes: {
      nodes: {
        filter: {
          and: [
            {
              equals: {
                property: [
                  CORE_DM_3D_CONTAINER_SPACE,
                  COGNITE_CAD_NODE_SOURCE.externalId,
                  'model3D'
                ],
                value: { parameter: 'modelReference' }
              }
            },
            {
              containsAny: {
                property: [
                  CORE_DM_3D_CONTAINER_SPACE,
                  COGNITE_CAD_NODE_SOURCE.externalId,
                  'treeIndexes'
                ],
                values: { parameter: 'treeIndexes' }
              }
            },
            {
              containsAny: {
                property: [
                  CORE_DM_3D_CONTAINER_SPACE,
                  COGNITE_CAD_NODE_SOURCE.externalId,
                  'revisions'
                ],
                values: { parameter: 'revisionRef' }
              }
            }
          ]
        }
      }
    },
    objects_3d: {
      nodes: {
        from: 'cad_nodes',
        through: { view: COGNITE_CAD_NODE_SOURCE, identifier: 'object3D' }
      }
    },
    assets: {
      nodes: {
        from: 'objects_3d',
        through: { view: COGNITE_3D_OBJECT_SOURCE, identifier: 'asset' },
        direction: 'outwards'
      }
    }
  },
  select: {
    cad_nodes: {
      sources: [
        {
          source: COGNITE_CAD_NODE_SOURCE,
          properties: [
            'name',
            'description',
            'tags',
            'aliases',
            'object3D',
            'model3D',
            'cadNodeReference',
            'revisions',
            'treeIndexes',
            'subTreeSizes'
          ]
        }
      ]
    },
    assets: {},
    objects_3d: {
      sources: [{ source: COGNITE_3D_OBJECT_SOURCE, properties: ['name', 'asset', 'cadNodes'] }]
    }
  }
} as const satisfies Omit<QueryRequest, 'cursors' | 'parameters'>;
