/*!
 * Copyright 2022 Cognite AS
 */

import { Vec3 } from '@reveal/utilities';

export type ParsedEptData = {
  numPoints: number;
  tightBoundingBox: { min: number[]; max: number[] };
  mean: number[];
  position: ArrayBuffer;
  color: ArrayBuffer | undefined;
  intensity: ArrayBuffer | undefined;
  classification: ArrayBuffer | undefined;
  returnNumber: ArrayBuffer | undefined;
  numberOfReturns: ArrayBuffer | undefined;
  pointSourceId: ArrayBuffer | undefined;
  indices: ArrayBuffer;
  objectId: ArrayBuffer;
};

export type SchemaEntry = {
  name: string;
  size: number;
  type: 'signed' | 'unsigned' | 'float';
};

export type EptInputData = {
  buffer: ArrayBuffer;
  schema: SchemaEntry[];
  scale: Vec3;
  offset: Vec3;
  mins: [number, number, number];
};
