/*!
 * Copyright 2024 Cognite AS
 */
import { type QueryRequest } from '@cognite/sdk/dist/src';
import { type TaggedAddResourceOptions } from '../../components/Reveal3DResources/types';
import { type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import {
  COGNITE_CAD_NODE_SOURCE,
  COGNITE_VISUALIZABLE_SOURCE,
  type CogniteCADNodeProperties,
  CORE_DM_SPACE
} from './dataModels';
import { cogniteCadNodeSourceWithProperties } from './cogniteCadNodeSourceWithProperties';
import { getModelIdFromExternalId, getRevisionIdFromExternalId } from './getCdfIdFromExternalId';

export async function getCadModelsForInstance(
  instance: DmsUniqueIdentifier,
  fdmSdk: FdmSDK
): Promise<TaggedAddResourceOptions[]> {
  const parameters = { instanceExternalId: instance.externalId, instanceSpace: instance.space };

  const query = {
    ...cadModelsForInstanceQuery,
    parameters
  };

  const results = await fdmSdk.queryAllNodesAndEdges<
    typeof query,
    [{ source: typeof COGNITE_CAD_NODE_SOURCE; properties: CogniteCADNodeProperties }]
  >(query);

  return results.items.cad_nodes.flatMap((cadNode) => {
    const props = cadNode.properties[CORE_DM_SPACE]['CogniteCADNode/v1'];
    return props.revisions.map((revision) => ({
      type: 'cad',
      addOptions: {
        modelId: getModelIdFromExternalId(props.model3D.externalId),
        revisionId: getRevisionIdFromExternalId(revision.externalId)
      }
    }));
  });
}

const cadModelsForInstanceQuery = {
  with: {
    asset: {
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
      }
    },
    object_3ds: {
      nodes: {
        from: 'asset',
        through: {
          view: COGNITE_VISUALIZABLE_SOURCE,
          identifier: 'object3D'
        },
        direction: 'outwards'
      }
    },
    cad_nodes: {
      nodes: {
        from: 'object_3ds',
        through: { view: COGNITE_CAD_NODE_SOURCE, identifier: 'object3D' }
      }
    }
  },
  select: {
    cad_nodes: { sources: cogniteCadNodeSourceWithProperties }
  }
} as const satisfies Omit<QueryRequest, 'parameters' | 'cursor'>;
