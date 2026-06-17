/*!
 * Copyright 2026 Cognite AS
 */

import { Fn, floor, float, mod, round, vec2 } from 'three/tsl';

export const packTreeIndex = Fn(([treeIndex]) => {
  const roundedTreeIndex = round(treeIndex);
  const treeIndexThousands = floor(roundedTreeIndex.div(1000.0));
  const treeIndexSubThousands = mod(roundedTreeIndex, 1000.0);
  return vec2(treeIndexThousands, treeIndexSubThousands);
});

export const unpackTreeIndex = Fn(([treeIndexPacked]) => {
  return round(treeIndexPacked.x).mul(1000.0).add(round(treeIndexPacked.y));
});
