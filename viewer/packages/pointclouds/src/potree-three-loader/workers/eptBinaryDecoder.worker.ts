/*!
 * Copyright 2022 Cognite AS
 */

import { parseEpt } from './parseEpt';
import type { EptInputData, ParsedEptData } from './types';
import type { SerializableStylableObject } from '@reveal/data-providers';
import type { AABB, Vec3 } from '@reveal/utilities';
import * as Comlink from 'comlink';

async function parse(
  data: EptInputData,
  objects: SerializableStylableObject[],
  pointOffset: Vec3,
  boundingBox: AABB
): Promise<ParsedEptData | Error> {
  const result = await parseEpt(data, objects, pointOffset, boundingBox);
  return Comlink.transfer(
    result,
    [
      result.position,
      result.color,
      result.intensity,
      result.classification,
      result.returnNumber,
      result.numberOfReturns,
      result.pointSourceId,
      result.indices,
      result.objectId
    ].filter(assertDefined)
  );
}

function assertDefined(buffer: ArrayBuffer | undefined): buffer is ArrayBuffer {
  return buffer !== undefined;
}

Comlink.expose(parse);

export type EptBinaryDecoderWorker = typeof parse;
