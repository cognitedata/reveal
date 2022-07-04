/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

import { RawStylableObject, StylableObject, rawToStylableObject } from '../../styling/StylableObject';

import { parseEpt, EptInputData } from './parseEpt';
import { Vec3 } from '../../styling/shapes/linalg';

const ctx: Worker = self as any;

let objectList: StylableObject[] = [];
let pointOffset: Vec3 = [0, 0, 0];

type CommandType = 'objects' | 'parse';

export interface ICommand {
  type: CommandType;
}

export type ObjectsCommand = {
  type: 'objects';
  objects: RawStylableObject[];
  pointOffset: Vec3;
};

export type ParseCommand = {
  type: 'parse';
  data: EptInputData;
};

ctx.onmessage = function (event: MessageEvent<ICommand>) {
  const command = event.data as ICommand;
  const box = new THREE.Box3();
  box.expandByPoint(new THREE.Vector3(0, 0, 0));
  box.expandByPoint(new THREE.Vector3(1, -1, 1));
  console.log("[worker] Three box = ", box);


  switch (command.type) {
    case 'objects':
      const objectsCommand = command as ObjectsCommand;
      objectList = objectsCommand.objects.map(rawToStylableObject);
      pointOffset = objectsCommand.pointOffset;
      break;
    case 'parse':
      const parseCommand = command as ParseCommand;
      parseEpt(ctx, parseCommand.data, objectList, pointOffset);
      break;
    default:
      console.error('Unrecognized eptBinaryDecoder worker command');
  }
};

export default null as any;
