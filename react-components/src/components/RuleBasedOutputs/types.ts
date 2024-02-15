/*!
 * Copyright 2023 Cognite AS
 */

import { type NumericRange } from '@cognite/reveal';

export type NodeAndRange = {
  treeIndex: number;
  nodeId: number;
  subtreeRange: NumericRange;
};
