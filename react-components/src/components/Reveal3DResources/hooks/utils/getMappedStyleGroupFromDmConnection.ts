/*!
 * Copyright 2025 Cognite AS
 */
import { type NodeAppearance, IndexSet } from '@cognite/reveal';
import { type FdmConnectionWithNode } from '../../../CacheProvider/types';
import { type TreeIndexStylingGroup } from '../../../CadModelContainer';
import { getNodeSubtreeNumericRange } from './getNodeSubtreeNumericRange';

export function getMappedStyleGroupFromDmConnection(
  edges: FdmConnectionWithNode[],
  mapped: NodeAppearance
): TreeIndexStylingGroup {
  const indexSet = new IndexSet();
  edges.forEach((edge) => {
    const treeIndexRange = getNodeSubtreeNumericRange(edge.cadNode);
    indexSet.addRange(treeIndexRange);
  });

  return { treeIndexSet: indexSet, style: mapped };
}
