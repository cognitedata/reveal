/*!
 * Copyright 2024 Cognite AS
 */
import { type InstancesWithView } from '../../query/useSearchMappedEquipmentFDM';
import { getDirectRelationProperties } from '../utils/getDirectRelationProperties';
import {
  type Cognite3DObjectProperties,
  type COGNITE_3D_OBJECT_SOURCE,
  COGNITE_ASSET_VIEW_VERSION_KEY,
  type COGNITE_CAD_NODE_SOURCE,
  COGNITE_CAD_NODE_VIEW_VERSION_KEY,
  type COGNITE_IMAGE_360_SOURCE,
  type COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  COGNITE_POINT_CLOUD_VOLUME_VIEW_VERSION_KEY,
  type CogniteAssetProperties,
  CORE_DM_SPACE
} from './dataModels';
import { type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import { type FdmKey } from '../../components/CacheProvider/types';
import { createFdmKey } from '../../components/CacheProvider/idAndKeyTranslation';
import { type PromiseType } from '../utils/typeUtils';
import { isString } from 'lodash';
import { type QueryResult } from '../utils/queryNodesAndEdges';
import { createCheck3dConnectedEquipmentQuery } from './check3dConnectedEquipmentQuery';
import { restrictToDmsId } from '../../utilities/restrictToDmsId';
import { isCoreDmAssetNode } from './utils/typeGuards';

export async function filterNodesByMappedTo3d(
  nodes: InstancesWithView[],
  revisionRefs: DmsUniqueIdentifier[],
  _spacesToSearch: string[],
  fdmSdk: FdmSDK
): Promise<Array<InstancesWithView<CogniteAssetProperties>>> {
  if (nodes.length === 0 || revisionRefs.length === 0) {
    return [];
  }

  const connectionData = await fetchConnectionData(nodes, revisionRefs, fdmSdk);

  const object3dKeys: Set<FdmKey> = createRelevantObject3dKeys(connectionData);

  return nodes.map((viewWithNodes) => {
    return {
      view: viewWithNodes.view,
      instances: viewWithNodes.instances.filter(isCoreDmAssetNode).filter((instance) => {
        const object3dId =
          instance.properties[CORE_DM_SPACE][COGNITE_ASSET_VIEW_VERSION_KEY].object3D;
        if (!isString(object3dId.externalId) || !isString(object3dId.space)) {
          return false;
        }
        return object3dKeys.has(createFdmKey(object3dId));
      })
    };
  });
}

function createRelevantObject3dKeys(
  connectionData: PromiseType<ReturnType<typeof fetchConnectionData>>
): Set<FdmKey> {
  const cadObject3dList = [...connectionData.items.initial_nodes_cad_nodes]
    .concat(connectionData.items.direct_nodes_cad_nodes)
    .concat(connectionData.items.indirect_nodes_cad_nodes)
    .map((node) =>
      createFdmKey(node.properties[CORE_DM_SPACE][COGNITE_CAD_NODE_VIEW_VERSION_KEY].object3D)
    );

  const pointCloudObject3dList = [...connectionData.items.initial_nodes_point_cloud_volumes]
    .concat(connectionData.items.direct_nodes_point_cloud_volumes)
    .concat(connectionData.items.indirect_nodes_point_cloud_volumes)
    .map((pointCloudVolume) =>
      createFdmKey(
        pointCloudVolume.properties[CORE_DM_SPACE][COGNITE_POINT_CLOUD_VOLUME_VIEW_VERSION_KEY]
          .object3D
      )
    );

  const relevant360NodeKeys = new Set<FdmKey>(
    [
      ...connectionData.items.initial_nodes_360_images,
      ...connectionData.items.direct_nodes_360_images,
      ...connectionData.items.indirect_nodes_360_images
    ].map(createFdmKey)
  );

  const relevant360AnnotationEdges = [
    ...connectionData.items.initial_edges_360_image_annotations,
    ...connectionData.items.direct_edges_360_image_annotations,
    ...connectionData.items.indirect_edges_360_image_annotations
  ].filter((edge) => relevant360NodeKeys.has(createFdmKey(edge.endNode)));

  const image360Object3dList = relevant360AnnotationEdges.map((edge) =>
    createFdmKey(edge.startNode)
  );

  return new Set<FdmKey>([...cadObject3dList, ...pointCloudObject3dList, ...image360Object3dList]);
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

async function fetchConnectionData(
  nodes: InstancesWithView[],
  revisionRefs: DmsUniqueIdentifier[],
  fdmSdk: FdmSDK
): Promise<
  QueryResult<ReturnType<typeof createCheck3dConnectedEquipmentQuery>, SelectSourcesType>
> {
  const initialIds = nodes.flatMap((node) => node.instances.map(restrictToDmsId));

  const directlyConnectedIds = nodes.flatMap((node) =>
    node.instances.flatMap((instance) => getDirectRelationProperties(instance).map(restrictToDmsId))
  );

  const parameters = { revisionRefs };
  const rawQuery = createCheck3dConnectedEquipmentQuery(
    initialIds,
    directlyConnectedIds,
    revisionRefs
  );

  const query = {
    ...rawQuery,
    parameters
  };

  return await fdmSdk.queryAllNodesAndEdges<typeof query, SelectSourcesType>(query);
}
