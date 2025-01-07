import { DMInstanceRef } from '@reveal/utilities';
import { GetImage360AnnotationsFromCollectionResponse } from './fetchCoreDm360AnnotationsForCollection';

export function getObject3dAssetMap(queryResponse: GetImage360AnnotationsFromCollectionResponse) {
  // TODO: Could probably be simplified by using lodash groupBy
  return queryResponse.items.assets.reduce(
    (acc, asset) => {
      const properties = asset.properties['cdf_cdm']['CogniteAsset/v1'];

      if (!acc[properties.object3D.externalId]) {
        acc[properties.object3D.externalId] = {};
      }

      acc[properties.object3D.externalId][properties.object3D.space] = {
        externalId: asset.externalId,
        space: asset.space,
        name: properties.name
      };
      return acc;
    },
    {} as Record<string, Record<string, DMInstanceRef & { name: string }>>
  );
}
