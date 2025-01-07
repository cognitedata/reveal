/*!
 * Copyright 2025 Cognite AS
 */
import { DMInstanceRef } from '@reveal/utilities';
import { GetImage360AnnotationsFromCollectionResponse } from './fetchCoreDm360AnnotationsForCollection';
import { CoreDmImage360Properties } from './properties';

export function getImage360Map(
  queryResponse: GetImage360AnnotationsFromCollectionResponse
): Record<string, Record<string, DMInstanceRef & CoreDmImage360Properties>> {
  return queryResponse.items.images.reduce(
    (acc, image) => {
      if (!acc[image.externalId]) {
        acc[image.externalId] = {};
      }
      acc[image.externalId][image.space] = {
        externalId: image.externalId,
        space: image.space,
        ...image.properties['cdf_cdm']['Cognite360Image/v1']
      };
      return acc;
    },
    {} as Record<string, Record<string, DMInstanceRef & CoreDmImage360Properties>>
  );
}
