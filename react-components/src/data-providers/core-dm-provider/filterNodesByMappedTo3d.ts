import {
  type InstancesWithView,
  type InstancesWithViewDefinition
} from '../../query/useSearchMappedEquipmentFDM';
import {
  type Cognite3DObjectProperties,
  type COGNITE_3D_OBJECT_SOURCE,
  type COGNITE_CAD_NODE_SOURCE,
  COGNITE_CAD_NODE_VIEW_VERSION_KEY,
  type COGNITE_IMAGE_360_SOURCE,
  type COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  COGNITE_POINT_CLOUD_VOLUME_VIEW_VERSION_KEY,
  CORE_DM_SPACE
} from './dataModels';
import { type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import { type FdmKey } from '../../components/CacheProvider/types';
import { createFdmKey } from '../../components/CacheProvider/idAndKeyTranslation';
import { chunk, concat, uniqBy } from 'lodash';
import { createCheck3dConnectedEquipmentQuery } from './check3dConnectedEquipmentQuery';
import { restrictToDmsId } from '../../utilities/restrictToDmsId';
import { isDefined } from '../../utilities/isDefined';
import { isDmsInstance } from '../../utilities/instanceIds';
import { getCogniteAssetDirectRelationProperties } from '../utils/getCogniteAssetDirectRelationProperties';
import { transformViewItemToSource } from './utils/transformViewItemToSource';
import type { QueryResult } from '../utils/queryNodesAndEdges';

export async function filterNodesByMappedTo3d(
  nodes: InstancesWithViewDefinition[],
  revisionRefs: DmsUniqueIdentifier[],
  _spacesToSearch: string[],
  fdmSdk: FdmSDK,
  includeIndirectRelations: boolean
): Promise<InstancesWithView[]> {
  if (nodes.length === 0 || revisionRefs.length === 0) {
    return [];
  }

  const object3dKeys = await getObject3dsConnectedToAssetAndModelRevisions(
    nodes,
    revisionRefs,
    fdmSdk,
    includeIndirectRelations
  );

  const result = nodes.map(async (viewWithNodes) => {
    const spaceFromView = viewWithNodes.view.space;
    const externalIdFromView = viewWithNodes.view.externalId;
    const assetVersion = viewWithNodes.view.version;
    const assetExternalIdWithVersion = `${externalIdFromView}/${assetVersion}`;
    return {
      view: viewWithNodes.view,
      instances: viewWithNodes.instances.filter((instance) => {
        const object3dId =
          instance.properties[spaceFromView]?.[assetExternalIdWithVersion]?.object3D;
        if (!isDmsInstance(object3dId)) {
          return false;
        }
        return object3dKeys.has(createFdmKey(object3dId));
      })
    };
  });

  const data = await Promise.all(result);

  return data
    .map((viewWithNodes) => ({
      view: transformViewItemToSource(viewWithNodes.view),
      instances: viewWithNodes.instances
    }))
    .filter(isDefined);
}

type SelectSourcesType = [
  { source: typeof COGNITE_3D_OBJECT_SOURCE; properties: Cognite3DObjectProperties },
  { source: typeof COGNITE_CAD_NODE_SOURCE; properties: { object3D: DmsUniqueIdentifier } },
  {
    source: typeof COGNITE_POINT_CLOUD_VOLUME_SOURCE;
    properties: { object3D: DmsUniqueIdentifier };
  },
  {
    source: typeof COGNITE_IMAGE_360_SOURCE;
    properties: { collection360: DmsUniqueIdentifier };
  }
];

async function getObject3dsConnectedToAssetAndModelRevisions(
  nodes: InstancesWithViewDefinition[],
  revisionRefs: DmsUniqueIdentifier[],
  fdmSdk: FdmSDK,
  includeIndirectRelations: boolean
): Promise<Set<FdmKey>> {
  const initialIds = nodes.flatMap((node) => node.instances.map(restrictToDmsId));

  const directlyConnectedIds = nodes
    .flatMap((node) =>
      node.instances.flatMap((instance) =>
        getCogniteAssetDirectRelationProperties(instance, node.view)
      )
    )
    .filter((node) => isDefined(node) && node.externalId !== undefined && node.space !== undefined);

  const mergedIds = concat(initialIds, directlyConnectedIds);
  const uniqueIds = uniqBy(mergedIds, createFdmKey);

  // Can maximum filter on 2K instances at a time using instanceReferences filter
  const chunkedIds = chunk(uniqueIds, 2000);

  const parameters = { revisionRefs };

  const object3dConnectedToEquipmentAndModel: FdmKey[] = [];
  for (const idChunk of chunkedIds) {
    const rawQuery = createCheck3dConnectedEquipmentQuery(idChunk, revisionRefs);

    const query = {
      ...rawQuery,
      parameters
    };

    const result = await fdmSdk.queryAllNodesAndEdges<typeof query, SelectSourcesType>(query);
    object3dConnectedToEquipmentAndModel.push(
      ...getRelevantObject3ds(result, includeIndirectRelations)
    );
  }

  return new Set<FdmKey>(object3dConnectedToEquipmentAndModel);
}

function getRelevantObject3ds(
  connectionData: QueryResult<
    ReturnType<typeof createCheck3dConnectedEquipmentQuery>,
    SelectSourcesType
  >,
  includeIndirectRelations: boolean
): FdmKey[] {
  const cadObject3dList = [...connectionData.items.initial_nodes_cad_nodes]
    .concat(includeIndirectRelations ? connectionData.items.indirect_nodes_cad_nodes : [])
    .map((node) =>
      createFdmKey(node.properties[CORE_DM_SPACE][COGNITE_CAD_NODE_VIEW_VERSION_KEY].object3D)
    );

  const pointCloudObject3dList = [...connectionData.items.initial_nodes_point_cloud_volumes]
    .concat(includeIndirectRelations ? connectionData.items.indirect_nodes_point_cloud_volumes : [])
    .map((pointCloudVolume) =>
      createFdmKey(
        pointCloudVolume.properties[CORE_DM_SPACE][COGNITE_POINT_CLOUD_VOLUME_VIEW_VERSION_KEY]
          .object3D
      )
    );

  const relevant360NodeKeys = new Set<FdmKey>(
    [
      ...connectionData.items.initial_nodes_360_images,
      ...(includeIndirectRelations ? connectionData.items.indirect_nodes_360_images : [])
    ].map(createFdmKey)
  );

  const relevant360AnnotationEdges = [
    ...connectionData.items.initial_edges_360_image_annotations,
    ...(includeIndirectRelations ? connectionData.items.indirect_edges_360_image_annotations : [])
  ].filter((edge) => relevant360NodeKeys.has(createFdmKey(edge.endNode)));

  const image360Object3dList = relevant360AnnotationEdges.map((edge) =>
    createFdmKey(edge.startNode)
  );

  return [...cadObject3dList, ...pointCloudObject3dList, ...image360Object3dList];
}
