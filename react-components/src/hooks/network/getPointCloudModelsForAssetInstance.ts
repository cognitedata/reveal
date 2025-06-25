import { type TaggedAddResourceOptions } from '../../components';
import { type COGNITE_POINT_CLOUD_VOLUME_SOURCE } from '../../data-providers/core-dm-provider/dataModels';
import { pointCloudModelsForInstanceQuery } from '../../data-providers/core-dm-provider/pointCloudModelsForInstanceQuery';
import { type DmsUniqueIdentifier, type FdmSDK } from '../../data-providers/FdmSDK';
import { type PointCloudVolumeObject3DProperties } from '../../data-providers/core-dm-provider/utils/filters';

export const getPointCloudModelsForAssetInstance = async (
  assetInstance: DmsUniqueIdentifier,
  fdmSdk: FdmSDK
): Promise<TaggedAddResourceOptions[]> => {
  const parameters = {
    instanceExternalId: assetInstance.externalId,
    instanceSpace: assetInstance.space
  };

  const query = {
    ...pointCloudModelsForInstanceQuery,
    parameters
  };

  const results = await fdmSdk.queryAllNodesAndEdges<
    typeof query,
    [
      {
        source: typeof COGNITE_POINT_CLOUD_VOLUME_SOURCE;
        properties: PointCloudVolumeObject3DProperties;
      }
    ]
  >(query);

  return results.items.pointcloud_volumes.flatMap((pointCloudVolume) => {
    const pointCloudVolumeProperties =
      pointCloudVolume.properties.cdf_cdm['CognitePointCloudVolume/v1'];
    return pointCloudVolumeProperties.revisions.map((revision) => ({
      type: 'pointcloud',
      addOptions: {
        revisionExternalId: revision.externalId,
        revisionSpace: revision.space
      }
    }));
  });
};
