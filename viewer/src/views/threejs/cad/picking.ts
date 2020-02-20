/*!
 * Copyright 2020 Cognite AS
 */

import { CadNode } from './CadNode';
import { pickPixelColor, PickingInput } from '../pickPixelColor';
import { RenderMode } from '../materials';

interface TreeIndexPickingInput extends PickingInput {
  cadNode: CadNode;
}

export function pickTreeIndex(input: TreeIndexPickingInput) {
  const { cadNode } = input;
  const previousRenderMode = cadNode.renderMode;
  cadNode.renderMode = RenderMode.TreeIndex;
  const pixelBuffer = pickPixelColor(input);
  cadNode.renderMode = previousRenderMode;

  const treeIndex = pixelBuffer[0] * 255 * 255 + pixelBuffer[1] * 255 + pixelBuffer[2];
  return treeIndex;
}
