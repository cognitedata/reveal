/*!
 * Copyright 2022 Cognite AS
 */

import { StylableObject } from '../../styling/StylableObject';
import { assignPoints } from '../../../wasm';
import { Cylinder } from '../../styling/shapes/Cylinder';
import { Box } from '../../styling/shapes/Box';

function getWasmShape(obj: StylableObject): any {
  if (obj.shape instanceof Cylinder) {
    const cylinder = obj.shape as Cylinder;
    return {
      object_id: obj.objectId,
      cylinder: {
        center_a: cylinder.centerA.toArray(),
        center_b: cylinder.centerB.toArray(),
        radius: cylinder.radius
      }
    };
  } else if (obj.shape instanceof Box) {
    const box = obj.shape as Box;
    return {
      object_id: obj.objectId,
      oriented_box: {
        inv_instance_matrix: box.invMatrix.toArray()
      }
    };
  } else {
    throw Error('Unrecognized shape type');
  }
}

export async function assignPointsWithWasm(
  points: Float32Array,
  objects: StylableObject[],
  pointOffset: THREE.Vector3,
  sectorBoundingBox: THREE.Box3
): Promise<Uint16Array> {
  const wasmShapes = objects.map(obj => getWasmShape(obj));

  const res = assignPoints(
    wasmShapes,
    points,
    { min: sectorBoundingBox.min.toArray(), max: sectorBoundingBox.max.toArray() },
    pointOffset.toArray()
  );

  return res;
}
