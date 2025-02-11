/*!
 * Copyright 2025 Cognite AS
 */
import { type NodeAppearance, IndexSet, NumericRange } from '@cognite/reveal';
import { type AssetMapping3D } from '@cognite/sdk';
import { type TreeIndexStylingGroup } from '../../../CadModelContainer';

export function getMappedStyleGroupFromAssetMappings(
  assetMappings: AssetMapping3D[],
  nodeAppearance: NodeAppearance
): TreeIndexStylingGroup {
  const indexSet = new IndexSet();
  assetMappings.forEach((assetMapping) => {
    if (assetMapping.treeIndex === undefined || assetMapping.subtreeSize === undefined) return;
    const range = new NumericRange(assetMapping.treeIndex, assetMapping.subtreeSize);
    indexSet.addRange(range);
  });

  return { treeIndexSet: indexSet, style: nodeAppearance };
}
