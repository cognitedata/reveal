/*!
 * Copyright 2022 Cognite AS
 */

import { RawStylableObject, rawToStylableObject } from '../../styling/StylableObject';
import { Vec3 } from '../../styling/shapes/linalg';
import * as THREE from 'three';
import { computeObjectIdBuffer } from './assignObjects';

const ctx: Worker = self as any;

export interface PointToObjectAssignmentCommand {
  positionBuffer: Float32Array;
  objectList: RawStylableObject[];
  pointOffset: Vec3;
};

export interface PointToObjectAssignmentResult {
  objectIdBuffer: ArrayBuffer;
};

ctx.onmessage = function (event: MessageEvent<PointToObjectAssignmentCommand>) {
  const command = event.data;
  const objects = command.objectList.map(rawToStylableObject);
  const offset = new THREE.Vector3().fromArray(command.pointOffset);

  const objectIdBuffer = computeObjectIdBuffer(command.positionBuffer, objects, offset);
  ctx.postMessage({ objectIdBuffer } as PointToObjectAssignmentResult, [objectIdBuffer]);
}

export default null as any;
