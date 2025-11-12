/*!
 * Copyright 2025 Cognite AS
 */
import { Euler, Quaternion, Spherical, Vector3 } from 'three';
import { CoreDmImage360Properties } from './properties';
import assert from 'assert';
import { isSemanticVersionGreaterThanOrEqual, SemanticVersion } from './semanticVersioningUtils';

export function transformSphericalCoordinatesToVectors(
  phiThetaPairs: number[],
  imageProperties: CoreDmImage360Properties,
  annotationFormatVersion: SemanticVersion
): Vector3[] {
  assert(phiThetaPairs.length % 2 === 0, 'phiThetaPairs must have an even length');

  const rotationOrder = getEulerRotationOrderFromFormatVersion(annotationFormatVersion);

  const euler = new Euler(
    imageProperties.eulerRotationX,
    imageProperties.eulerRotationY,
    imageProperties.eulerRotationZ,
    rotationOrder
  );

  const quaternion = new Quaternion().setFromEuler(euler);

  const polarCoordinates: Spherical[] = [];
  for (let i = 0; i < phiThetaPairs.length; i += 2) {
    const phi = phiThetaPairs[i];
    const theta = phiThetaPairs[i + 1];
    polarCoordinates.push(new Spherical(1, phi, theta));
  }

  return polarCoordinates.map(spherical => {
    const vector = new Vector3().setFromSpherical(spherical);
    vector.applyQuaternion(quaternion);
    return vector;
  });
}

function getEulerRotationOrderFromFormatVersion(formatVersion: SemanticVersion): 'XYZ' | 'XZY' {
  if (isSemanticVersionGreaterThanOrEqual(formatVersion, '1.0.1')) {
    return 'XZY';
  }
  return 'XYZ';
}
