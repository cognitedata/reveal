/*!
 * Copyright 2022 Cognite AS
 */

import { RawStylableObject, rawToStylableObject } from '../../styling/StylableObject';

import { parseEpt, EptInputData, ParsedEptData } from './parseEpt';
import { Vec3 } from '../../styling/shapes/linalg';
import * as THREE from 'three';

import { setupTransferableMethodsOnWorker } from '@reveal/utilities';

setupTransferableMethodsOnWorker({
  parse: {
    fn: parse,
    pickTransferablesFromResult: (result: ParsedEptData) => {
      return [
        result.position,
        result.color,
        result.intensity,
        result.classification,
        result.returnNumber,
        result.numberOfReturns,
        result.pointSourceId,
        result.indices,
        result.objectId
      ].filter(assertDefined);
    }
  }
});

export async function parse(
  data: EptInputData,
  objects: RawStylableObject[],
  pointOffset: Vec3,
  sectorBoundingBox: [Vec3, Vec3]
): Promise<ParsedEptData> {
  const objectList = objects.map(rawToStylableObject);
  const point = new THREE.Vector3().fromArray(pointOffset);
  const boundingBox = new THREE.Box3(
    new THREE.Vector3().fromArray(sectorBoundingBox[0]),
    new THREE.Vector3().fromArray(sectorBoundingBox[1])
  );
  return parseEpt(data, objectList, point, boundingBox);
}

function assertDefined(buffer: ArrayBuffer | undefined): buffer is ArrayBuffer {
  return buffer !== undefined;
}
