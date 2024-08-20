import { Node3D, QueryRequest } from '@cognite/sdk';
import { FdmCadConnection, FdmKey } from '../../components/CacheProvider/types';
import { DmsUniqueIdentifier, FdmSDK } from '../FdmSDK';
import {
  Cognite3DObjectProperties,
  COGNITE_3D_OBJECT_SOURCE,
  COGNITE_ASSET_SOURCE,
  COGNITE_CAD_NODE_SOURCE,
  CogniteAssetProperties,
  CogniteCADNodeProperties
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

  const treeIndexToNodeIdMap = new Map(nodes.map((node) => [node.treeIndex, node.id]));

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
    const props = cadNode.properties.cdf_cdm_experimental['CogniteCADNode/v1'];
    const revisionIndex = props.revisions.findIndex((id) => id === revisionRef);

    const treeIndex = props.treeIndexes[revisionIndex];
    const relevant = treeIndexSet.has(treeIndex);

    if (relevant) {
      relevantCadNodeRefToObject3dRef.set(toFdmKey(cadNode), toFdmKey(props.object3D));
      treeIndexToCadNodeMap.set(treeIndex, toFdmKey(cadNode));
    }
  });

  const relevantObjects3D = result.items.objects_3d.filter((object3D) => {
    return (
      object3D.properties.cdf_cdm_experimental['CogniteObject3D/v1']
        .cadNodes as DmsUniqueIdentifier[]
    ).some((cadNodeId) => relevantCadNodeRefToObject3dRef.has(toFdmKey(cadNodeId)));
  });

  const relevantObjectToAssetsMap = new Map<FdmKey, DmsUniqueIdentifier[]>(
    relevantObjects3D.map((obj) => [
      toFdmKey(obj),
      obj.properties.cdf_cdm_experimental['CogniteObject3D/v1'].asset
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
                  COGNITE_CAD_NODE_SOURCE.space,
                  COGNITE_CAD_NODE_SOURCE.externalId,
                  'model3D'
                ],
                value: { parameter: 'modelReference' }
              }
            },
            {
              containsAny: {
                property: [
                  COGNITE_CAD_NODE_SOURCE.space,
                  COGNITE_CAD_NODE_SOURCE.externalId,
                  'treeIndexes'
                ],
                values: { parameter: 'treeIndexes' }
              }
            },
            {
              containsAny: {
                property: [
                  COGNITE_CAD_NODE_SOURCE.space,
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
        through: { source: COGNITE_CAD_NODE_SOURCE, identifier: 'object3D' }
      }
    },
    assets: {
      nodes: {
        from: 'objects_3d',
        through: { source: COGNITE_3D_OBJECT_SOURCE, identifier: 'asset' },
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
