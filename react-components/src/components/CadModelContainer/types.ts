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

export type CadStyleGroup = NodeStylingGroup | TreeIndexStylingGroup;

export type CadModelStyling = {
  defaultStyle?: NodeAppearance;
  groups?: CadStyleGroup[];
};
