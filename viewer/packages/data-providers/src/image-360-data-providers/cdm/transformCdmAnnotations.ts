/*!
 * Copyright 2025 Cognite AS
 */
import { getImage360Map } from './getImage360Map';
import { CoreDmImage360Annotation } from './types';
import { getObject3dAssetMap } from './getObject3dAssetMap';
import { GetImage360AnnotationsFromCollectionResponse } from './fetchCoreDm360AnnotationsForCollection';
import { GetImage360FromRevisionResponse } from './fetchCoreDm360AnnotationsForRevision';
import assert from 'assert';
import { readAnnotations } from './readAnnotations';
import { isSemanticVersion } from './semanticVersioningUtils';

export function transformAnnotations(
  queryResponse: GetImage360AnnotationsFromCollectionResponse | GetImage360FromRevisionResponse
): CoreDmImage360Annotation[] {
  const object3dAssetMap = getObject3dAssetMap(queryResponse);

  const image360Map = getImage360Map(queryResponse);

  return queryResponse.items.annotations
    .filter(annotation => annotation.properties['cdf_cdm']['Cognite360ImageAnnotation/v1'].polygon)
    .flatMap(annotation => {
      const connectedAsset = object3dAssetMap[annotation.startNode.externalId][annotation.startNode.space];

      const connectedImage = image360Map[annotation.endNode.externalId][annotation.endNode.space];

      const properties = annotation.properties['cdf_cdm']['Cognite360ImageAnnotation/v1'];
      assert(properties.polygon, 'Polygon must be defined in annotation properties');

      const formatVersion = properties.formatVersion ?? '1.0.0';
      const semanticVersion = isSemanticVersion(formatVersion) ? formatVersion : '1.0.0';
      const annotations = readAnnotations(semanticVersion, connectedImage, properties.polygon);

      return annotations.map(vectors => {
        return {
          sourceType: 'dm',
          status: 'approved',
          connectedImageId: {
            externalId: connectedImage.externalId,
            space: connectedImage.space
          },
          annotationIdentifier: {
            externalId: annotation.externalId,
            space: annotation.space
          },
          assetRef: {
            externalId: connectedAsset.externalId,
            space: connectedAsset.space
          },
          polygon: vectors
        } satisfies CoreDmImage360Annotation;
      });
    });
}
