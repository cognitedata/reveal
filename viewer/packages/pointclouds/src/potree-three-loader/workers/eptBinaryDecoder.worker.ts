/*!
 * Copyright 2022 Cognite AS
 */

import { RawStylableObject, rawToStylableObject } from '../../styling/StylableObject';

import { parseEpt, EptInputData, ParsedEptData } from './parseEpt';
import { Vec3 } from '../../styling/shapes/linalg';
import { setupTransferableMethodsOnWorker } from '@naoak/workerize-transferable';

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
  objects: RawStylableObject[],
  pointOffset: Vec3
): Promise<ParsedEptData> {
  const objectList = objects.map(rawToStylableObject);
  pointOffset = pointOffset;
  return parseEpt(self as any, data, objectList, pointOffset);
}

function assertDefined(buffer: ArrayBuffer | undefined): buffer is ArrayBuffer {
  return buffer !== undefined;
}
