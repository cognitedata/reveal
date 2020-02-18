/*!
 * Copyright 2020 Cognite AS
 */

import { CadNode } from './CadNode';
import { pickPixelColor, PickingInput } from '../pickPixelColor';

export function pickTreeIndex(input: PickingInput, cadNode: CadNode) {
  cadNode.renderMode = 3;
  const pixelBuffer = pickPixelColor(input);
  cadNode.renderMode = 1;

  const treeIndex = pixelBuffer[0] * 255 * 255 + pixelBuffer[1] * 255 + pixelBuffer[2];
  return treeIndex;
}
