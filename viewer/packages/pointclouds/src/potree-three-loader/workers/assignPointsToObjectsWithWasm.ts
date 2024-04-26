/*!
 * Copyright 2022 Cognite AS
 */

import { SerializableStylableObject } from '@reveal/data-providers';
import { assertNever, SerializableCylinder, SerializableBox, ShapeType } from '@reveal/utilities';

import { WasmSerializedPointCloudObject, assignPoints } from '../../../wasm';
import type { Vector3, Box3 } from 'three';

function createWasmSerializedObject(obj: SerializableStylableObject): WasmSerializedPointCloudObject {
  switch (obj.shape.shapeType) {
    case ShapeType.Cylinder: {
      const cylinder = obj.shape as SerializableCylinder;
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
      const box = obj.shape as SerializableBox;
      return {
        object_id: obj.objectId,
        oriented_box: {
          inv_instance_matrix: box.invMatrix.data
        }
      };
    }
    case ShapeType.Composite: {
      throw Error('Cannot assign points to objects - encountered unexpected composite object');
    }
    default:
      assertNever(obj.shape.shapeType);
  }
}

export async function assignPointsToObjectsWithWasm(
  points: Float32Array,
  objects: SerializableStylableObject[],
  pointOffset: Vector3,
  sectorBoundingBox: Box3
): Promise<Uint16Array> {
  const wasmShapes = objects.map(obj => createWasmSerializedObject(obj));

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
