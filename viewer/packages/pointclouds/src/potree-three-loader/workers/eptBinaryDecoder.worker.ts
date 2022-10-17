/*!
 * Copyright 2022 Cognite AS
 */

import { parseEpt  } from './parseEpt';
import { EptInputData, ParsedEptData } from './types';
import { SerializableStylableObject } from '@reveal/data-providers';
import { setupTransferableMethodsOnWorker, AABB, Vec3 } from '@reveal/utilities';

setupTransferableMethodsOnWorker({
  parse: {
    fn: parse,
    pickTransferablesFromResult: (result: ParsedEptData) => {
      return [
        result.position,
        result.color,
        result.intensity,
        result.classification,
        result.returnNumber,
        result.numberOfReturns,
        result.pointSourceId,
        result.indices,
        result.objectId
      ].filter(assertDefined);
    }
  }
});

export async function parse(
  data: EptInputData,
  objects: SerializableStylableObject[],
  pointOffset: Vec3,
  boundingBox: AABB
): Promise<ParsedEptData | Error> {
  return parseEpt(data, objects, pointOffset, boundingBox).catch(e => e as Error);
}

function assertDefined(buffer: ArrayBuffer | undefined): buffer is ArrayBuffer {
  return buffer !== undefined;
}
