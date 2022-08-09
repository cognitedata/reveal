/*!
 * Copyright 2022 Cognite AS
 */

import { StylableObject } from '../../styling/StylableObject';

import init, { assign_points } from '@reveal/wasm';
import wasmData from '@reveal/wasm/reveal_rust_wasm_bg.wasm';
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
    }
  } else if (obj.shape instanceof Box) {
    const box = obj.shape as Box
    return {
      object_id: obj.objectId,
      oriented_box: {
        inv_instance_matrix: box.invMatrix.toArray()
      }
    }
  } else {
    throw Error("Unrecognized shape type");
  }
}

export async function assignPointsWithWasm(
  points: Float32Array,
  objects: StylableObject[],
  pointOffset: THREE.Vector3,
  sectorBoundingBox: THREE.Box3): Promise<Uint16Array> {

  /* await init(wasmData).then(_mod => {
    console.log('Loaded Wasm, running it:');

    const res = assign_points([{ cylinder: { center_a: [0, 0, 0],
                                             center_b: [1, 1, 1],
                                             radius: 2 } }],
                              points,
                              { min: sectorBoundingBox.min, max: sectorBoundingBox.max },
                              pointOffset); */
  const wasmShapes = objects.map(obj => getWasmShape(obj));

  const res = await init(wasmData).then(() =>
    assign_points(wasmShapes,
                  points,
                  { min: sectorBoundingBox.min.toArray(),
                    max: sectorBoundingBox.max.toArray() },
                  pointOffset.toArray()));
  // console.log("Result = ", mod.main_js(30, arr));

  return res;
}
