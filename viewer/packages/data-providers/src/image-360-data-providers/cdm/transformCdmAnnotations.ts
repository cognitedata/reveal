/*!
 * Copyright 2025 Cognite AS
 */
import { Euler, Quaternion, Spherical, Vector3 } from 'three';
import { getImage360Map } from './getImage360Map';
import { CoreDmImage360Annotation } from './types';
import { getObject3dAssetMap } from './getObject3dAssetMap';
import { GetImage360AnnotationsFromCollectionResponse } from './fetchCoreDm360AnnotationsForCollection';
import { GetImage360FromRevisionResponse } from './fetchCoreDm360AnnotationsForRevision';

export function transformAnnotations(
  queryResponse: GetImage360AnnotationsFromCollectionResponse | GetImage360FromRevisionResponse
): CoreDmImage360Annotation[] {
  const object3dAssetMap = getObject3dAssetMap(queryResponse);

  const image360Map = getImage360Map(queryResponse);

  return queryResponse.items.annotations.map(annotation => {
    const connectedAsset = object3dAssetMap[annotation.startNode.externalId][annotation.startNode.space];

    const connectedImage = image360Map[annotation.endNode.externalId][annotation.endNode.space];

    const properties = annotation.properties['cdf_cdm']['Cognite360ImageAnnotation/v1'];

    const euler = new Euler(
      connectedImage.eulerRotationX,
      connectedImage.eulerRotationY,
      connectedImage.eulerRotationZ
    );
    const quaternion = new Quaternion().setFromEuler(euler);

    const polarCoordinates: Spherical[] = [];
    for (let i = 0; i < properties.polygon.length; i += 2) {
      const phi = properties.polygon[i];
      const theta = properties.polygon[i + 1];
      polarCoordinates.push(new Spherical(1, phi, theta));
    }

    const vectors = polarCoordinates.map(spherical => new Vector3().setFromSpherical(spherical));

    const transformedVectors = vectors.map(vector => vector.applyQuaternion(quaternion));

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
      polygon: transformedVectors
    } satisfies CoreDmImage360Annotation;
  });
}
