/*!
 * Copyright 2024 Cognite AS
 */
import { type InstancesWithView } from '../../query/useSearchMappedEquipmentFDM';
import { getDirectRelationProperties } from '../utils/getDirectRelationProperties';
import {
  type Cognite3DObjectProperties,
  type COGNITE_3D_OBJECT_SOURCE,
  COGNITE_CAD_NODE_SOURCE,
  COGNITE_CAD_NODE_VIEW_VERSION_KEY,
  COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  COGNITE_POINT_CLOUD_VOLUME_VIEW_VERSION_KEY,
  CORE_DM_SPACE
} from './dataModels';
import { type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import { type FdmKey } from '../../components/CacheProvider/types';
import { createFdmKey } from '../../components/CacheProvider/idAndKeyTranslation';
import { type PromiseType } from '../utils/typeUtils';
import { isString } from 'lodash';
import { type QueryResult } from '../utils/queryNodesAndEdges';
import { check3dConnectedEquipmentQuery } from './check3dConnectedEquipmentQuery';

export async function filterNodesByMappedTo3d(
  nodes: InstancesWithView[],
  revisionRefs: DmsUniqueIdentifier[],
  _spacesToSearch: string[],
  fdmSdk: FdmSDK
): Promise<InstancesWithView[]> {
  const connectionData = await fetchConnectionData(nodes, revisionRefs, fdmSdk);

  const object3dKeys: Set<FdmKey> = createRelevantObject3dKeys(connectionData);

  const result = nodes.map((viewWithNodes) => {
    if (viewWithNodes.view.externalId !== 'CogniteAsset') {
      return {
        view: viewWithNodes.view,
        instances: []
      };
    }
    return {
      view: viewWithNodes.view,
      instances: viewWithNodes.instances.filter((instance) => {
        const object3dId = instance.properties.object3D as unknown as
          | DmsUniqueIdentifier
          | undefined;
        if (!isString(object3dId?.externalId) || !isString(object3dId?.space)) {
          return false;
        }
        return object3dKeys.has(createFdmKey(object3dId));
      })
    };
  });

  return result;
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

  return new Set<FdmKey>([...cadObject3dList, ...pointCloudObject3dList]);
}

type SelectSourcesType = [
  { source: typeof COGNITE_3D_OBJECT_SOURCE; properties: Cognite3DObjectProperties },
  { source: typeof COGNITE_CAD_NODE_SOURCE; properties: { object3D: DmsUniqueIdentifier } },
  {
    source: typeof COGNITE_POINT_CLOUD_VOLUME_SOURCE;
    properties: { object3D: DmsUniqueIdentifier };
  }
];

async function fetchConnectionData(
  nodes: InstancesWithView[],
  revisionRefs: DmsUniqueIdentifier[],
  fdmSdk: FdmSDK
): Promise<QueryResult<typeof check3dConnectedEquipmentQuery, SelectSourcesType>> {
  const initialExternalIds = nodes.flatMap((node) =>
    node.instances.map((instance) => instance.externalId)
  );

  const directlyMappedIds = nodes.flatMap((node) =>
    node.instances.flatMap((instance) =>
      getDirectRelationProperties(instance).map((props) => props.externalId)
    )
  );

  const parameters = { initialExternalIds, directlyMappedIds, revisionRefs };

  const query = {
    ...check3dConnectedEquipmentQuery,
    parameters
  };

  return await fdmSdk.queryAllNodesAndEdges<typeof query, SelectSourcesType>(query);
}
