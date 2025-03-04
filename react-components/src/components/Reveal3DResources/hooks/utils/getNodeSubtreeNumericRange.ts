/*!
 * Copyright 2025 Cognite AS
 */

import { NumericRange } from '@cognite/reveal';
import { type Node3D } from '@cognite/sdk';

export function getNodeSubtreeNumericRange(node: Node3D): NumericRange {
  return new NumericRange(node.treeIndex, node.subtreeSize);
}
