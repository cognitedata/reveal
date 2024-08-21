/*!
 * Copyright 2024 Cognite AS
 */
import { type QueryRequest } from '@cognite/sdk/dist/src';
import { type FdmCadConnection, type FdmKey } from '../../components/CacheProvider/types';
import { type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import {
  type Cognite3DObjectProperties,
  type COGNITE_3D_OBJECT_SOURCE,
  COGNITE_CAD_NODE_SOURCE,
  type CogniteCADNodeProperties
} from './dataModels';
import { cogniteObject3dSourceWithProperties } from './cogniteObject3dSourceWithProperties';
import { cogniteCadNodeSourceWithPRoperties } from './cogniteCadNodeSourceWithProperties';
import { getModelIdFromExternalId, getRevisionIdFromExternalId } from './getCdfIdFromExternalId';
import { toFdmKey } from '../utils/toFdmKey';
import { type PromiseType } from '../utils/typeUtils';
import { isDefined } from '../../utilities/isDefined';
import { type QueryResult } from '../utils/queryNodesAndEdges';

export async function getCadConnectionsForRevisions(
  modelRevisions: Array<[DmsUniqueIdentifier, DmsUniqueIdentifier]>,
  fdmSdk: FdmSDK
): Promise<FdmCadConnection[]> {
  const results = await getModelConnectionResults(modelRevisions, fdmSdk);

  const cadNodeToModelMap = createNodeToModelMap(modelRevisions, results.items.cad_nodes);

  return results.items.object_3ds.flatMap((obj) => {
    const props = obj.properties.cdf_cdm_experimental['CogniteObject3D/v1'];

    return props.cadNodes
      .map((cadNode) => {
        const modelObj = cadNodeToModelMap.get(toFdmKey(cadNode));
        if (modelObj === undefined) {
          return undefined;
        }
        return { ...modelObj, instance: obj };
      })
      .filter(isDefined);
  });
}

type SourcesSelectType = [
  { source: typeof COGNITE_3D_OBJECT_SOURCE; properties: Cognite3DObjectProperties },
  { source: typeof COGNITE_CAD_NODE_SOURCE; properties: CogniteCADNodeProperties }
];

async function getModelConnectionResults(
  modelRevisions: Array<[DmsUniqueIdentifier, DmsUniqueIdentifier]>,
  fdmSdk: FdmSDK
): Promise<QueryResult<typeof cadConnectionsQuery, SourcesSelectType>> {
  const parameters = {
    modelRefs: modelRevisions.map(([modelRef, _revisionRef]) => modelRef),
    revisionRefs: modelRevisions.map(([_modelRef, revisionRef]) => revisionRef)
  };

  const query = {
    ...cadConnectionsQuery,
    parameters
  };

  return await fdmSdk.queryAllNodesAndEdges<typeof query, SourcesSelectType>(query);
}

function createNodeToModelMap(
  modelRevisions: Array<[DmsUniqueIdentifier, DmsUniqueIdentifier]>,
  cadNodes: PromiseType<ReturnType<typeof getModelConnectionResults>>['items']['cad_nodes']
): Map<FdmKey, Omit<FdmCadConnection, 'instance'>> {
  return cadNodes.reduce((nodeMap, cadNode) => {
    const props = cadNode.properties.cdf_cdm_experimental['CogniteCADNode/v1'];
    const modelRevisionPair = modelRevisions.find(
      ([modelRef, _revisionRef]) =>
        props.model3D.externalId === modelRef.externalId && props.model3D.space === modelRef.space
    );
    if (modelRevisionPair === undefined) {
      return nodeMap;
    }

    const revisionIndex = props.revisions.findIndex(
      (propRevision) =>
        modelRevisionPair[1].externalId === propRevision.externalId &&
        modelRevisionPair[1].space === propRevision.space
    );

    if (revisionIndex === -1) {
      return nodeMap;
    }

    const modelId = getModelIdFromExternalId(props.model3D.externalId);
    const revisionId = getRevisionIdFromExternalId(props.revisions[revisionIndex].externalId);

    nodeMap.set(toFdmKey(cadNode), {
      modelId,
      revisionId,
      treeIndex: props.treeIndexes[revisionIndex]
    });

    return nodeMap;
  }, new Map<FdmKey, Omit<FdmCadConnection, 'instance'>>());
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
                  COGNITE_CAD_NODE_SOURCE.space,
                  COGNITE_CAD_NODE_SOURCE.externalId,
                  'model3D'
                ],
                values: { parameter: 'modelRefs' }
              }
            },
            {
              containsAny: {
                property: [
                  COGNITE_CAD_NODE_SOURCE.space,
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
    object_3ds: {
      nodes: {
        from: 'cad_nodes',
        through: { view: COGNITE_CAD_NODE_SOURCE, identifier: 'object3D' }
      }
    }
  },
  select: {
    cad_nodes: { sources: cogniteCadNodeSourceWithPRoperties },
    object_3ds: { sources: cogniteObject3dSourceWithProperties }
  }
} as const satisfies Omit<QueryRequest, 'cursor' | 'parameters'>;
