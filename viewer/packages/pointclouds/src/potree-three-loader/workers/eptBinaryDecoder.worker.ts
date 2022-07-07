/*!
 * Copyright 2022 Cognite AS
 */

import { RawStylableObject, StylableObject, rawToStylableObject } from '../../styling/StylableObject';

import { parseEpt, EptInputData } from './parseEpt';
import { Vec3 } from '../../styling/shapes/linalg';
import * as THREE from 'three';

const ctx: Worker = self as any;

let objectList: StylableObject[] = [];
let pointOffset = [0, 0, 0];

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

  switch (command.type) {
    case 'objects':
      const objectsCommand = command as ObjectsCommand;
      objectList = objectsCommand.objects.map(rawToStylableObject);
      pointOffset = objectsCommand.pointOffset;
      break;
    case 'parse':
      const parseCommand = command as ParseCommand;
      const threePointOffset = new THREE.Vector3().fromArray(pointOffset);
      parseEpt(ctx, parseCommand.data, objectList, threePointOffset);
      break;
    default:
      console.error('Unrecognized eptBinaryDecoder worker command');
  }
};

export default null as any;
