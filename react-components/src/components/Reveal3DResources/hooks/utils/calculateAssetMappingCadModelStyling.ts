/*!
 * Copyright 2025 Cognite AS
 */
import { IndexSet, NumericRange } from '@cognite/reveal';
import { type Node3D } from '@cognite/sdk';
import { type AssetStylingGroup, type CadModelOptions, type ModelStyleGroup } from '../../types';
import { type AssetId } from '../../../CacheProvider/types';

export function calculateAssetMappingCadModelStyling(
  stylingGroups: AssetStylingGroup[],
  nodeMap: Map<AssetId, Node3D[]>,
  model: CadModelOptions
): ModelStyleGroup {
  const treeIndexSetsWithStyle = stylingGroups
    .map((group) => {
      const indexSet = new IndexSet();
      group.assetIds
        .map((assetId) => nodeMap.get(assetId))
        .forEach((nodeList) =>
          nodeList
            ?.filter((node): node is Node3D => node !== undefined)
            .forEach((node) => {
              indexSet.addRange(new NumericRange(node.treeIndex, node.subtreeSize));
            })
        );

      return {
        treeIndexSet: indexSet,
        style: group.style.cad
      };
    })
    .filter((setWithStyle) => setWithStyle.treeIndexSet.count > 0);

  return {
    model,
    styleGroup: treeIndexSetsWithStyle
  };
}
