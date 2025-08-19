/*!
 * Copyright 2025 Cognite AS
 */
import { Euler, Quaternion, Spherical, Vector3 } from 'three';
import { getImage360Map } from './getImage360Map';
import { CoreDmImage360Annotation } from './types';
import { getObject3dAssetMap } from './getObject3dAssetMap';
import { GetImage360AnnotationsFromCollectionResponse } from './fetchCoreDm360AnnotationsForCollection';
import { GetImage360FromRevisionResponse } from './fetchCoreDm360AnnotationsForRevision';
import assert from 'assert';

export function transformAnnotations(
  queryResponse: GetImage360AnnotationsFromCollectionResponse | GetImage360FromRevisionResponse
): CoreDmImage360Annotation[] {
  const object3dAssetMap = getObject3dAssetMap(queryResponse);

  const image360Map = getImage360Map(queryResponse);

  return queryResponse.items.annotations
    .filter(annotation => annotation.properties['cdf_cdm']['Cognite360ImageAnnotation/v1'].polygon)
    .map(annotation => {
      const connectedAsset = object3dAssetMap[annotation.startNode.externalId][annotation.startNode.space];

      const connectedImage = image360Map[annotation.endNode.externalId][annotation.endNode.space];

      const properties = annotation.properties['cdf_cdm']['Cognite360ImageAnnotation/v1'];
      assert(properties.polygon, 'Polygon must be defined in annotation properties');

      const formatVersion = properties.formatVersion ?? '1.0.0'; // Default to '1.0.0' if not defined
      const rotationOrder = getEulerRotationOrderFromFormatVersion(formatVersion);
      const euler = new Euler(
        connectedImage.eulerRotationX,
        connectedImage.eulerRotationY,
        connectedImage.eulerRotationZ,
        rotationOrder
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

function getEulerRotationOrderFromFormatVersion(formatVersion: string): 'XYZ' | 'XZY' {
  if (isSemanticVersionGreaterThanOrEqual(formatVersion, '1.0.1')) {
    return 'XZY';
  }
  return 'XYZ';
}

type SemanticVersion = `${number}.${number}.${number}`;

/**
 * Checks if a string is a valid semantic version.
 * @param version The semantic version string (e.g., "1.0.0").
 * @returns True if the version is valid, false otherwise.
 */
function isSemanticVersion(version: string): version is SemanticVersion {
  const semverRegex: RegExp = /^([1-9]\d*|0)(\.(([1-9]\d*)|0)){2}$/;
  return semverRegex.test(version);
}

/**
 * Compares a string to a target semantic version. If the string is not a semantic version, it returns false.
 * @param formatVersion The semantic version string to compare (e.g., "1.0.0").
 * @param targetVersion The target semantic version string (e.g., "1.0.1").
 * @returns True if formatVersion >= targetVersion, false otherwise.
 */
function isSemanticVersionGreaterThanOrEqual(formatVersion: string, targetVersion: SemanticVersion): boolean {
  if (!isSemanticVersion(formatVersion)) {
    return false;
  }

  const [major, minor, patch] = formatVersion.split('.').map(Number);
  const [targetMajor, targetMinor, targetPatch] = targetVersion.split('.').map(Number);

  if (major > targetMajor) return true;
  if (major === targetMajor && minor > targetMinor) return true;
  if (major === targetMajor && minor === targetMinor && patch >= targetPatch) return true;

  return false;
}
