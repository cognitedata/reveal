import {
  type AssetStylingGroupAndStyleIndex,
  type ColorRuleOutput,
  type RuleAndStyleIndex
} from '../types';
import { NumericRange, TreeIndexNodeCollection } from '@cognite/reveal';
import { type ClassicAssetStylingGroup } from '../../Reveal3DResources';
import { Color } from 'three';
import { createRuleStyling } from './createRuleStyling';
import { type ClassicCadAssetMapping } from '../../CacheProvider/cad/assetMappingTypes';

export const applyAssetMappingsNodeStyles = (
  treeNodes: ClassicCadAssetMapping[],
  outputSelected: ColorRuleOutput
): AssetStylingGroupAndStyleIndex => {
  const ruleOutputAndStyleIndex: RuleAndStyleIndex = {
    styleIndex: new TreeIndexNodeCollection(),
    ruleOutputParams: outputSelected
  };

  const nodeIndexSet = ruleOutputAndStyleIndex.styleIndex.getIndexSet();
  nodeIndexSet.clear();

  const assetIds: number[] = [];

  for (const node of treeNodes) {
    const range = new NumericRange(node.treeIndex, node.subtreeSize);
    nodeIndexSet.addRange(range);

    assetIds.push(node.assetId);
  }
  ruleOutputAndStyleIndex.styleIndex.updateSet(nodeIndexSet);

  const nodeAppearance = createRuleStyling({
    color: new Color(outputSelected.fill)
  });

  const assetStylingGroup: ClassicAssetStylingGroup = {
    assetIds,
    style: { cad: nodeAppearance, pointcloud: nodeAppearance }
  };

  const stylingGroup: AssetStylingGroupAndStyleIndex = {
    styleIndex: ruleOutputAndStyleIndex.styleIndex,
    assetStylingGroup
  };
  return stylingGroup;
};
