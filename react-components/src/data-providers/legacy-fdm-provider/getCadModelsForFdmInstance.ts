import { type TaggedAddCadResourceOptions } from '../../components/Reveal3DResources/types';
import { type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import { type InModel3dEdgeProperties, SYSTEM_3D_EDGE_SOURCE } from './dataModels';
import { isDefined } from '../../utilities/isDefined';
import { type QueryRequest } from '@cognite/sdk';

export async function getCadModelsForFdmInstance(
  sdk: FdmSDK,
  instance: DmsUniqueIdentifier
): Promise<TaggedAddCadResourceOptions[]> {
  const query = {
    ...modelsForInstanceQuery,
    parameters: { instanceExternalId: instance.externalId, instanceSpace: instance.space }
  };
  const result = (
    await sdk.queryNodesAndEdges<
      typeof query,
      [{ source: typeof SYSTEM_3D_EDGE_SOURCE; properties: InModel3dEdgeProperties }]
    >(query)
  ).items;

  const modelAndRevisionIds = result.model_edges
    .map((edge) => {
      const properties = Object.values(Object.values(edge.properties)[0])[0];

      const modelIdString = edge.endNode.externalId;
      const modelId = Number(modelIdString);

      if (isNaN(modelId)) {
        return undefined;
      }

      return { type: 'cad' as const, addOptions: { modelId, revisionId: properties.revisionId } };
    })
    .filter(isDefined);

  return modelAndRevisionIds;
}

const modelsForInstanceQuery = {
  with: {
    start_instance: {
      nodes: {
        filter: {
          and: [
            {
              equals: {
                property: ['node', 'externalId'],
                value: { parameter: 'instanceExternalId' }
              }
            },
            {
              equals: {
                property: ['node', 'space'],
                value: { parameter: 'instanceSpace' }
              }
            }
          ]
        }
      },
      limit: 1
    },
    model_edges: {
      edges: {
        from: 'start_instance',
        maxDistance: 1,
        direction: 'outwards',
        filter: {
          and: [
            {
              hasData: [SYSTEM_3D_EDGE_SOURCE]
            }
          ]
        }
      },
      limit: 1000
    }
  },
  select: {
    model_edges: {
      sources: [{ source: SYSTEM_3D_EDGE_SOURCE, properties: ['revisionId', 'revisionNodeId'] }]
    }
  }
} as const satisfies Omit<QueryRequest, 'cursor' | 'parameters'>;
