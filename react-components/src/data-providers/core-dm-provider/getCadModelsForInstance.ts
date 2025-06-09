import { type TaggedAddResourceOptions } from '../../components/Reveal3DResources/types';
import { type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import {
  type COGNITE_CAD_NODE_SOURCE,
  COGNITE_CAD_NODE_VIEW_VERSION_KEY,
  type CogniteCADNodeProperties,
  CORE_DM_SPACE
} from './dataModels';
import { getModelIdFromExternalId, getRevisionIdFromExternalId } from './getCdfIdFromExternalId';
import { cadModelsForInstanceQuery } from './cadModelsForInstanceQuery';

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
    const props = cadNode.properties[CORE_DM_SPACE][COGNITE_CAD_NODE_VIEW_VERSION_KEY];
    return props.revisions.map((revision) => ({
      type: 'cad',
      addOptions: {
        modelId: getModelIdFromExternalId(props.model3D.externalId),
        revisionId: getRevisionIdFromExternalId(revision.externalId)
      }
    }));
  });
}
