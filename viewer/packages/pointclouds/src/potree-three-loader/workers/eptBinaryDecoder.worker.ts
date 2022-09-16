/*!
 * Copyright 2022 Cognite AS
 */

import { parseEpt, EptInputData, ParsedEptData } from './parseEpt';
import { AABB, Vec3 } from '../../styling/shapes/linalg';
import { setupTransferableMethodsOnWorker } from '@reveal/utilities';
import { StylableObject } from '../../styling/StylableObject';

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
  objects: StylableObject[],
  pointOffset: Vec3,
  boundingBox: AABB
): Promise<ParsedEptData | Error> {
  return parseEpt(data, objects, pointOffset, boundingBox).catch(e => e as Error);
}

function assertDefined(buffer: ArrayBuffer | undefined): buffer is ArrayBuffer {
  return buffer !== undefined;
}
