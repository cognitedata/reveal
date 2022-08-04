/*!
 * Copyright 2022 Cognite AS
 */

import { RawStylableObject, rawToStylableObject } from '../../styling/StylableObject';

import { parseEpt, EptInputData, ParsedEptData } from './parseEpt';
import { Vec3 } from '../../styling/shapes/linalg';

export async function Parse(
  data: EptInputData,
  objects: RawStylableObject[],
  pointOffset: Vec3
): Promise<ParsedEptData> {
  const objectList = objects.map(rawToStylableObject);
  pointOffset = pointOffset;
  return parseEpt(self as any, data, objectList, pointOffset);
}
