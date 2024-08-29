/*!
 * Copyright 2024 Cognite AS
 */
import { type Node3D, type QueryRequest } from '@cognite/sdk';
import { type FdmCadConnection, type FdmKey } from '../../components/CacheProvider/types';
import { type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import {
  type Cognite3DObjectProperties,
  type COGNITE_3D_OBJECT_SOURCE,
  COGNITE_ASSET_SOURCE,
  COGNITE_CAD_NODE_SOURCE,
  COGNITE_VISUALIZABLE_SOURCE,
  type CogniteAssetProperties,
  type CogniteCADNodeProperties,
  type CogniteVisualizableProperties,
  CORE_DM_3D_CONTAINER_SPACE,
  CORE_DM_SPACE
} from './dataModels';
import { getModelIdFromExternalId } from './getCdfIdFromExternalId';
import { createFdmKey } from '../../components/CacheProvider/idAndKeyTranslation';
import { cogniteCadNodeSourceWithProperties } from './cogniteCadNodeSourceWithProperties';
import { restrictToDmsId } from './restrictToDmsId';

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
    parameters: {
      modelReference: restrictToDmsId(model),
      treeIndexes,
      revisionRefs: [restrictToDmsId(revisionRef)]
    }
  };

  const modelId = getModelIdFromExternalId(model.externalId);

  const result = await fdmSdk.queryNodesAndEdges<
    typeof query,
    [
      { source: typeof COGNITE_ASSET_SOURCE; properties: CogniteAssetProperties },
      { source: typeof COGNITE_VISUALIZABLE_SOURCE; properties: CogniteVisualizableProperties },
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
      relevantCadNodeRefToObject3dRef.set(createFdmKey(cadNode), createFdmKey(props.object3D));
      treeIndexToCadNodeMap.set(treeIndex, createFdmKey(cadNode));
    }
  });

  const relevantObjectToAssetsMap = new Map<FdmKey, DmsUniqueIdentifier>(
    result.items.assets.map((asset) => [
      createFdmKey(asset.properties.cdf_cdm['CogniteVisualizable/v1'].object3D),
      asset
    ])
  );

  const connections = new Array<FdmCadConnection>();

  [...treeIndexToCadNodeMap.entries()].forEach(([treeIndex, nodeRefKey]) => {
    const object3dKey = relevantCadNodeRefToObject3dRef.get(nodeRefKey);
    if (object3dKey === undefined) {
      // Should not happen
      return;
    }
    const asset = relevantObjectToAssetsMap.get(object3dKey);

    if (asset === undefined) {
      // Should not happen
      return;
    }

    connections.push({ modelId, revisionId, treeIndex, instance: asset });
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
                values: { parameter: 'revisionRefs' }
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
        through: { view: COGNITE_ASSET_SOURCE, identifier: 'object3D' },
        direction: 'inwards'
      }
    }
  },
  select: {
    cad_nodes: {
      sources: cogniteCadNodeSourceWithProperties
    },
    assets: { sources: [{ source: COGNITE_VISUALIZABLE_SOURCE, properties: ['object3D'] }] },
    objects_3d: {}
  }
} as const satisfies Omit<QueryRequest, 'cursors' | 'parameters'>;
