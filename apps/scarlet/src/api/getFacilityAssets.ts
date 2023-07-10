import { CogniteClient, ListResponse, Asset } from '@cognite/sdk';
import { facilityParentAssetExternalIds } from 'config';
import { Facility } from 'types';

export const getFacilityAssets = async (
  client: CogniteClient
): Promise<Facility[]> => {
  const resp: Facility[] = [];
  const facilityAssets: ListResponse<Asset[]> = await client.assets.list({
    filter: { parentExternalIds: facilityParentAssetExternalIds },
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const facilityAsset of facilityAssets.items) {
    const facility: Facility = {
      id: facilityAsset.externalId!,
      path: facilityAsset.name?.toLowerCase(),
      name: facilityAsset.name,
      shortName: facilityAsset.name,
      datasetId: facilityAsset.dataSetId!,
      env: ['development', 'staging', 'production'],
      project: client.project,
    };

    resp.push(facility);
  }

  return resp;
};
