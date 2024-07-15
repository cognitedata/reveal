/*!
 * Copyright 2024 Cognite AS
 */
import { type IndexSet, type NodeAppearance } from '@cognite/reveal';

export type NodeStylingGroup = {
  nodeIds: number[];
  style?: NodeAppearance;
};

export type TreeIndexStylingGroup = {
  treeIndexSet: IndexSet;
  style?: NodeAppearance;
};

export type CadStylingGroup = NodeStylingGroup | TreeIndexStylingGroup;

export type CadModelStyling = {
  defaultStyle?: NodeAppearance;
  groups?: CadStylingGroup[];
};

export function isNodeStylingGroup(
  stylingGroup: CadStylingGroup
): stylingGroup is NodeStylingGroup {
  return 'nodeIds' in stylingGroup;
}

export function isTreeIndexStylingGroup(
  stylingGroup: CadStylingGroup
): stylingGroup is TreeIndexStylingGroup {
  return 'treeIndexSet' in stylingGroup;
}
