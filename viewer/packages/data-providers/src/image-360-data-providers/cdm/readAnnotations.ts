/*!
 * Copyright 2025 Cognite AS
 */
import { Vector3 } from 'three';

import { CoreDmImage360Properties } from './properties';
import { transformSphericalCoordinatesToVectors } from './transformSphericalCoordinatesToVectors';
import assert from 'assert';
import { isSemanticVersion, isSemanticVersionGreaterThanOrEqual, SemanticVersion } from './semanticVersioningUtils';

export function readAnnotations(
  formatVersion: SemanticVersion,
  imageProperties: CoreDmImage360Properties,
  data: number[]
): Vector3[][] {
  const phiThetaPairs = getPhiThetaPairsFromData(formatVersion, data);

  return phiThetaPairs.map(polygon => {
    return transformSphericalCoordinatesToVectors(polygon, imageProperties, formatVersion);
  });
}

function getPhiThetaPairsFromData(formatVersion: string, data: number[]): number[][] {
  const semanticVersion = isSemanticVersion(formatVersion) ? formatVersion : '1.0.0';

  if (isSemanticVersionGreaterThanOrEqual(semanticVersion, '2.0.0')) {
    return readV2Format(data);
  }

  return [data];
}

function readV2Format(data: number[]): number[][] {
  assert(data.length >= 7, 'Invalid data, format version 2.0.0 requires at least 7 numbers');

  const vertices: number[][] = [];
  let index = 0;
  while (index < data.length) {
    const numberOfVertices = data[index];
    const length = numberOfVertices * 2;
    assert(numberOfVertices >= 3, 'Invalid data, number of vertices must be at least 3');
    assert(index + length < data.length, 'Invalid data, out of bounds');
    vertices.push(data.slice(index + 1, index + length + 1));
    index += length + 1;
  }

  return vertices;
}
