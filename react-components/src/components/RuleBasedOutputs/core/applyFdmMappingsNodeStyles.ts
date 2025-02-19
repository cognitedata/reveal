import { NumericRange, TreeIndexNodeCollection } from "@cognite/reveal";
import { ColorRuleOutput, FdmInstanceNodeWithConnectionAndProperties, FdmStylingGroupAndStyleIndex, RuleAndStyleIndex } from "../types";
import { createRuleStyling } from "./createRuleStyling";
import { Color } from "three";
import { DmsUniqueIdentifier } from "../../../data-providers";
import { FdmAssetStylingGroup } from "../../Reveal3DResources";

export const applyFdmMappingsNodeStyles = (
  treeNodes: FdmInstanceNodeWithConnectionAndProperties[],
  outputSelected: ColorRuleOutput
): FdmStylingGroupAndStyleIndex => {
  const ruleOutputAndStyleIndex: RuleAndStyleIndex = {
    styleIndex: new TreeIndexNodeCollection(),
    ruleOutputParams: outputSelected
  };

  const nodeAppearance = createRuleStyling({
    color: new Color(outputSelected.fill)
  });

  const fdmAssetExternalIds: DmsUniqueIdentifier[] = [];

  const nodeIndexSet = ruleOutputAndStyleIndex.styleIndex.getIndexSet();
  nodeIndexSet.clear();

  for (const node of treeNodes) {
    if (node.cadNode === undefined) continue;

    const range = new NumericRange(node.cadNode.treeIndex, node.cadNode.subtreeSize);
    nodeIndexSet.addRange(range);

    if (node.connection === undefined) continue;
    fdmAssetExternalIds.push({
      space: node.connection?.instance.space,
      externalId: node.connection?.instance.externalId
    });
  }

  ruleOutputAndStyleIndex.styleIndex.updateSet(nodeIndexSet);

  const fdmStylingGroup: FdmAssetStylingGroup = {
    fdmAssetExternalIds,
    style: { cad: nodeAppearance, pointcloud: nodeAppearance }
  };

  const stylingGroup: FdmStylingGroupAndStyleIndex = {
    styleIndex: ruleOutputAndStyleIndex.styleIndex,
    fdmStylingGroup
  };
  return stylingGroup;
};
