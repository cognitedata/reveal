/*!
 * Copyright 2022 Cognite AS
 */

import { StylableObject } from '../../styling/StylableObject';
import { assignPoints } from '../../../wasm';
import { Cylinder } from '../../styling/shapes/Cylinder';
import { Box } from '../../styling/shapes/Box';

import { SerializedPointCloudObject } from '../../../wasm';
import { ShapeType } from '../../styling/shapes/IShape';
import { assertNever } from '@reveal/utilities';

function createSerializedObject(obj: StylableObject): SerializedPointCloudObject {
  switch (obj.shape.shapeType) {
    case ShapeType.Cylinder: {
      const cylinder = obj.shape as Cylinder;
      return {
        object_id: obj.objectId,
        cylinder: {
          center_a: cylinder.centerA,
          center_b: cylinder.centerB,
          radius: cylinder.radius
        }
      };
    }
    case ShapeType.Box: {
      const box = obj.shape as Box;
      return {
        object_id: obj.objectId,
        oriented_box: {
          inv_instance_matrix: box.invMatrix.data
        }
      };
    }
    case ShapeType.Composite: {
      throw Error('Composite types should not be sent to the parser worker, they should be decomposed first');
    }
    default:
      assertNever(obj.shape.shapeType);
  }
}

export async function assignPointsToObjectsWithWasm(
  points: Float32Array,
  objects: StylableObject[],
  pointOffset: THREE.Vector3,
  sectorBoundingBox: THREE.Box3
): Promise<Uint16Array> {
  const wasmShapes = objects.map(obj => createSerializedObject(obj));

  try {
    return await assignPoints(
      wasmShapes,
      points,
      { min: sectorBoundingBox.min.toArray(), max: sectorBoundingBox.max.toArray() },
      pointOffset.toArray()
    );
  } catch (errorMessage: any) {
    return Promise.reject(new Error(errorMessage as string));
  }
}
