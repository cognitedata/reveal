/*!
 * Copyright 2024 Cognite AS
 */
import { type QueryRequest } from '@cognite/sdk/dist/src';
import { type TaggedAddResourceOptions } from '../../components/Reveal3DResources/types';
import { type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import {
  COGNITE_3D_OBJECT_SOURCE,
  type COGNITE_CAD_NODE_SOURCE,
  COGNITE_VISUALIZABLE_SOURCE,
  type CogniteCADNodeProperties
} from './dataModels';
import { cogniteCadNodeSourceWithPRoperties } from './cogniteCadNodeSourceWithProperties';
import { getModelIdFromExternalId, getRevisionIdFromExternalId } from './getCdfIdFromExternalId';

export async function getCadModelsForInstance(
  instance: DmsUniqueIdentifier,
  fdmSdk: FdmSDK
): Promise<TaggedAddResourceOptions[]> {
  const parameters = { instanceIds: [instance] };

  const query = {
    ...cadModelsForInstanceQuery,
    parameters
  };

  const results = await fdmSdk.queryAllNodesAndEdges<
    typeof query,
    [{ source: typeof COGNITE_CAD_NODE_SOURCE; properties: CogniteCADNodeProperties }]
  >(query);

  return results.items.cad_nodes.flatMap((cadNode) => {
    const props = cadNode.properties.cdf_cdm_experimental['CogniteCADNode/v1'];
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
    object_3ds: {
      nodes: {
        filter: {
          containsAny: {
            property: [
              COGNITE_VISUALIZABLE_SOURCE.space,
              COGNITE_VISUALIZABLE_SOURCE.externalId,
              'object3D'
            ],
            values: { parameter: 'instanceId' }
          }
        }
      }
    },
    cad_nodes: {
      nodes: {
        from: 'object_3ds',
        through: { view: COGNITE_3D_OBJECT_SOURCE, identifier: 'cadNodes' }
      }
    }
  },
  select: {
    cad_nodes: { sources: cogniteCadNodeSourceWithPRoperties }
  }
} as const satisfies Omit<QueryRequest, 'parameters' | 'cursor'>;
