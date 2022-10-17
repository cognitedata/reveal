import { AABB, Vec3 } from '@reveal/utilities';
import { SerializableStylableObject } from '@reveal/data-providers';
import { assignPointsToObjectsWithWasm } from './assignPointsToObjectsWithWasm';

import { EptInputData, ParsedEptData, SchemaEntry } from './types';

import * as THREE from 'three';

export async function parseEpt(
  data: EptInputData,
  objects: SerializableStylableObject[],
  pointOffset: Vec3,
  sectorBoundingBox: AABB
): Promise<ParsedEptData> {
  const buffer = data.buffer;
  const view = new DataView(buffer);
  const schema: SchemaEntry[] = data.schema;
  const scale = data.scale;
  const offset = data.offset;
  const mins = data.mins;

  const dimensions: Record<string, SchemaEntry> = schema.reduce((p, c) => {
    p[c.name] = c;
    return p;
  }, {} as Record<string, SchemaEntry>);

  const dimOffset = (name: string) => {
    let offset = 0;
    for (let i = 0; i < schema.length; ++i) {
      if (schema[i].name === name) return offset;
      offset += schema[i].size;
    }
    return undefined;
  };

  function getExtractor(name: string) {
    const offset = dimOffset(name)!;
    const type = dimensions[name].type;
    const size = dimensions[name].size;

    if (type == 'signed')
      switch (size) {
        case 1:
          return (p: number) => view.getInt8(p + offset);
        case 2:
          return (p: number) => view.getInt16(p + offset, true);
        case 4:
          return (p: number) => view.getInt32(p + offset, true);
        default:
          throw Error('Unrecognized byte size for "signed" numbers');
      }
    if (type == 'unsigned')
      switch (size) {
        case 1:
          return (p: number) => view.getUint8(p + offset);
        case 2:
          return (p: number) => view.getUint16(p + offset, true);
        case 4:
          return (p: number) => view.getUint32(p + offset, true);
        default:
          throw Error('Unrecognized byte size for "unsigned" numbers');
      }
    if (type == 'float')
      switch (size) {
        case 4:
          return (p: number) => view.getFloat32(p + offset, true);
        case 8:
          return (p: number) => view.getFloat64(p + offset, true);
        default:
          throw Error('Unrecognized byte size for "float" numbers');
      }

    const str = JSON.stringify(dimensions[name]);
    throw new Error(`Invalid dimension specification for ${name}: ${str}`);
  }

  const pointSize = schema.reduce((p: number, c) => p + c.size, 0);
  const numPoints = buffer.byteLength / pointSize;

  let rgbBuffer: ArrayBuffer | undefined;
  let intensityBuffer: ArrayBuffer | undefined;
  let classificationBuffer: ArrayBuffer | undefined;
  let returnNumberBuffer: ArrayBuffer | undefined;
  let numberOfReturnsBuffer: ArrayBuffer | undefined;
  let pointSourceIdBuffer: ArrayBuffer | undefined;

  let rgb: Uint8Array | undefined;
  let intensity: Float32Array | undefined;
  let classification: Uint8Array | undefined;
  let returnNumber: Uint8Array | undefined;
  let numberOfReturns: Uint8Array | undefined;
  let pointSourceId: Uint16Array | undefined;

  let rgbExtractor: ((name: number) => number)[];
  let intensityExtractor: (name: number) => number;
  let classificationExtractor: (name: number) => number;
  let returnNumberExtractor: (name: number) => number;
  let numberOfReturnsExtractor: (name: number) => number;
  let pointSourceIdExtractor: (name: number) => number;

  let twoByteColor = false;

  const xyzBuffer = new ArrayBuffer(numPoints * 4 * 3);
  const xyz = new Float32Array(xyzBuffer);
  const xyzExtractor = [getExtractor('X'), getExtractor('Y'), getExtractor('Z')];

  if (dimensions['Red'] && dimensions['Green'] && dimensions['Blue']) {
    rgbBuffer = new ArrayBuffer(numPoints * 4);
    rgb = new Uint8Array(rgbBuffer);
    rgbExtractor = [getExtractor('Red'), getExtractor('Green'), getExtractor('Blue')];

    let r: number, g: number, b: number, pos: number;
    for (let i = 0; i < numPoints && !twoByteColor; ++i) {
      pos = i * pointSize;
      r = rgbExtractor[0](pos);
      g = rgbExtractor[1](pos);
      b = rgbExtractor[2](pos);
      if (r > 255 || g > 255 || b > 255) twoByteColor = true;
    }
  }

  if (dimensions['Intensity']) {
    intensityBuffer = new ArrayBuffer(numPoints * 4);
    intensity = new Float32Array(intensityBuffer);
    intensityExtractor = getExtractor('Intensity');
  }

  if (dimensions['Classification']) {
    classificationBuffer = new ArrayBuffer(numPoints);
    classification = new Uint8Array(classificationBuffer);
    classificationExtractor = getExtractor('Classification');
  }

  if (dimensions['ReturnNumber']) {
    returnNumberBuffer = new ArrayBuffer(numPoints);
    returnNumber = new Uint8Array(returnNumberBuffer);
    returnNumberExtractor = getExtractor('ReturnNumber');
  }

  if (dimensions['NumberOfReturns']) {
    numberOfReturnsBuffer = new ArrayBuffer(numPoints);
    numberOfReturns = new Uint8Array(numberOfReturnsBuffer);
    numberOfReturnsExtractor = getExtractor('NumberOfReturns');
  }

  if (dimensions['PointSourceId']) {
    pointSourceIdBuffer = new ArrayBuffer(numPoints * 2);
    pointSourceId = new Uint16Array(pointSourceIdBuffer);
    pointSourceIdExtractor = getExtractor('PointSourceId');
  }

  const mean = [0, 0, 0];
  const bounds = {
    min: [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE],
    max: [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE]
  };

  let x: number;
  let y: number;
  let z: number;
  let r: number;
  let g: number;
  let b: number;

  for (let i = 0; i < numPoints; ++i) {
    const pos = i * pointSize;
    if (xyz) {
      x = xyzExtractor[0](pos) * scale[0] + offset[0] - mins[0];
      y = xyzExtractor[1](pos) * scale[1] + offset[1] - mins[1];
      z = xyzExtractor[2](pos) * scale[2] + offset[2] - mins[2];

      mean[0] += x / numPoints;
      mean[1] += y / numPoints;
      mean[2] += z / numPoints;

      bounds.min[0] = Math.min(bounds.min[0], x);
      bounds.min[1] = Math.min(bounds.min[1], y);
      bounds.min[2] = Math.min(bounds.min[2], z);

      bounds.max[0] = Math.max(bounds.max[0], x);
      bounds.max[1] = Math.max(bounds.max[1], y);
      bounds.max[2] = Math.max(bounds.max[2], z);

      xyz[3 * i + 0] = x;
      xyz[3 * i + 1] = y;
      xyz[3 * i + 2] = z;
    }

    if (rgb) {
      r = rgbExtractor![0](pos);
      g = rgbExtractor![1](pos)!;
      b = rgbExtractor![2](pos);

      if (twoByteColor) {
        r /= 256;
        g /= 256;
        b /= 256;
      }

      rgb[4 * i + 0] = r;
      rgb[4 * i + 1] = g;
      rgb[4 * i + 2] = b;
    }

    if (intensity) intensity[i] = intensityExtractor!(pos);
    if (classification) classification[i] = classificationExtractor!(pos);
    if (returnNumber) returnNumber[i] = returnNumberExtractor!(pos);
    if (numberOfReturns) numberOfReturns[i] = numberOfReturnsExtractor!(pos);
    if (pointSourceId) pointSourceId[i] = pointSourceIdExtractor!(pos);
  }

  const indicesBuffer = new ArrayBuffer(numPoints * 4);
  const indices = new Uint32Array(indicesBuffer);
  for (let i = 0; i < numPoints; ++i) {
    indices[i] = i;
  }

  const objectIdBuffer = (
    await assignPointsToObjectsWithWasm(
      xyz,
      objects,
      new THREE.Vector3().fromArray(pointOffset),
      new THREE.Box3(
        new THREE.Vector3().fromArray(sectorBoundingBox.min),
        new THREE.Vector3().fromArray(sectorBoundingBox.max)
      )
    )
  ).buffer;

  const message: ParsedEptData = {
    numPoints: numPoints,
    tightBoundingBox: bounds,
    mean: mean,

    position: xyzBuffer,
    color: rgbBuffer,
    intensity: intensityBuffer,
    classification: classificationBuffer,
    returnNumber: returnNumberBuffer,
    numberOfReturns: numberOfReturnsBuffer,
    pointSourceId: pointSourceIdBuffer,
    indices: indicesBuffer,
    objectId: objectIdBuffer
  };

  return message;
}
