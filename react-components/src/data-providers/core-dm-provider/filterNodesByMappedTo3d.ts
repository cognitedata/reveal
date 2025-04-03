/*!
 * Copyright 2024 Cognite AS
 */
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
import { type DmsUniqueIdentifier, type FdmSDK, type Source } from '../FdmSDK';
import { type FdmKey } from '../../components/CacheProvider/types';
import { createFdmKey } from '../../components/CacheProvider/idAndKeyTranslation';
import { type PromiseType } from '../utils/typeUtils';
import { isString, transform, uniqBy } from 'lodash';
import { type QueryResult } from '../utils/queryNodesAndEdges';
import { createCheck3dConnectedEquipmentQuery } from './check3dConnectedEquipmentQuery';
import { restrictToDmsId } from '../../utilities/restrictToDmsId';
import { isDefined } from '../../utilities/isDefined';
import { isDmsInstance } from '../../utilities/instanceIds';
import { getCogniteAssetDirectRelationProperties } from '../utils/getCogniteAssetDirectRelationProperties';
import { transformViewItemToSource } from './utils/transformViewItemToSource';

export async function filterNodesByMappedTo3d(
  nodes: InstancesWithViewDefinition[],
  revisionRefs: DmsUniqueIdentifier[],
  _spacesToSearch: string[],
  fdmSdk: FdmSDK
): Promise<InstancesWithView[]> {
  if (nodes.length === 0 || revisionRefs.length === 0) {
    return [];
  }

  const connectionData = await fetchConnectionData(nodes, revisionRefs, fdmSdk);

  const object3dKeys: Set<FdmKey> = createRelevantObject3dKeys(connectionData);

  const result = nodes.map(async (viewWithNodes) => {
    const spaceFromView = viewWithNodes.view.space;
    const externalIdFromView = viewWithNodes.view.externalId;
    const assetVersion = viewWithNodes.view.version;
    const assetExternalIdWithVersion = `${externalIdFromView}/${assetVersion}`;
    return {
      view: viewWithNodes.view,
      instances: viewWithNodes.instances.filter((instance) => {
        if (
          !isDmsInstance(instance.properties[spaceFromView]?.[assetExternalIdWithVersion]?.object3D)
        ) {
          return false;
        }
        const object3dId = instance.properties[spaceFromView][assetExternalIdWithVersion]?.object3D;
        if (!isString(object3dId.externalId) || !isString(object3dId.space)) {
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
  nodes: InstancesWithViewDefinition[],
  revisionRefs: DmsUniqueIdentifier[],
  fdmSdk: FdmSDK
): Promise<
  QueryResult<ReturnType<typeof createCheck3dConnectedEquipmentQuery>, SelectSourcesType>
> {
  const initialIds = nodes.flatMap((node) => node.instances.map(restrictToDmsId));

  const directlyConnectedIds = nodes
    .flatMap((node) =>
      node.instances.flatMap((instance) =>
        getCogniteAssetDirectRelationProperties(instance, node.view)
      )
    )
    .filter(isDefined);

  const uniqueDirectlyConnectedIds = uniqBy(
    directlyConnectedIds,
    (id) => id.externalId && id.space
  );

  const directlyConnectedIdsCappedAt1000Elements = uniqueDirectlyConnectedIds.slice(0, 1000);

  const parameters = { revisionRefs };
  const rawQuery = createCheck3dConnectedEquipmentQuery(
    initialIds,
    directlyConnectedIdsCappedAt1000Elements,
    revisionRefs
  );

  const query = {
    ...rawQuery,
    parameters
  };

  return await fdmSdk.queryAllNodesAndEdges<typeof query, SelectSourcesType>(query);
}
