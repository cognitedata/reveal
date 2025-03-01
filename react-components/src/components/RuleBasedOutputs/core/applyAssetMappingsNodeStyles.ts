/*!
 * Copyright 2025 Cognite AS
 */
import {
  type AssetStylingGroupAndStyleIndex,
  type ColorRuleOutput,
  type RuleAndStyleIndex
} from '../types';
import { NumericRange, TreeIndexNodeCollection } from '@cognite/reveal';
import { type AssetStylingGroup } from '../../Reveal3DResources';
import { Color } from 'three';
import { createRuleStyling } from './createRuleStyling';
import { type CdfAssetMapping } from '../../CacheProvider/types';

export const applyAssetMappingsNodeStyles = (
  treeNodes: CdfAssetMapping[],
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

  const assetStylingGroup: AssetStylingGroup = {
    assetIds,
    style: { cad: nodeAppearance, pointcloud: nodeAppearance }
  };

  const stylingGroup: AssetStylingGroupAndStyleIndex = {
    styleIndex: ruleOutputAndStyleIndex.styleIndex,
    assetStylingGroup
  };
  return stylingGroup;
};
