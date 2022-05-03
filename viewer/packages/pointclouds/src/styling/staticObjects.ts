/*!
 * Copyright 2022 Cognite AS
 */

import { RawStyleObject } from './StyleObject';
import { RawAxisAlignedBox } from './shapes/AxisAlignedBox';
import { RawCylinder } from './shapes/Cylinder';

import { externalObjects } from './data';

import { Vec3, v3Add, v3Sub, v3Scale } from './shapes/linalg';

/* export const hardCodedObjects: RawStyleObject[] = [
  {
    objectId: 1123192,
    shape: {
      type: 'aabb',
      box: {
        min: [- 445, - 477, 927],
        max: [- 435, - 467, 937]
        // min: [8, 3, 8],
        // max: [12, 12, 12]
      }
    } as RawAxisAlignedBox
  },
  {
    objectId: 2,
    shape: {
      type: 'cylinder',
      centerA: [-440, -470, 927],
      centerB: [-440, -470, 920],
      radius: 2
    } as RawCylinder
  }
  ]; */


export const hardCodedObjects: RawStyleObject[] = externalObjects.map((obj, index) => { return { objectId: index, shape: transformObject(obj) } } );

type ExtVec = {
  X: number;
  Y: number;
  Z: number;
};

type ExtCyl = {
  Radius: number;
  Center: ExtVec;
  FitConfidence: number;
  Height: number;
  Axis: ExtVec;
};

function extVecToV3(ev: ExtVec): Vec3 {
  return [ev.X, ev.Y, ev.Z];
}

function transformObject(obj: ExtCyl): RawCylinder {
  const halfHeightV3 = v3Scale(extVecToV3(obj.Axis), obj.Height / 2);
  return {
    type: 'cylinder',
    radius: obj.Radius + 0.1,
    centerA: v3Add(extVecToV3(obj.Center), halfHeightV3),
    centerB: v3Sub(extVecToV3(obj.Center), halfHeightV3)
  };
}
