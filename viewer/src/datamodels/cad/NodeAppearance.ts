/*!
 * Copyright 2020 Cognite AS
 */

export type NodeAppearanceOutline = {
  /**
   * The color of the outline.
   */
  color: [number, number, number, number];
  /**
   * The size of the outline.
   */
  thickness: number;
};

export type NodeAppearance = {
  /**
   * Overrides the default color of the node.
   */
  readonly color?: [number, number, number, number];
  /**
   * Overrides the visibility of the node.
   */
  readonly visible?: boolean;
  /**
   * When set to true, the node is rendered in front
   * of all other nodes even if it's occluded.
   */
  readonly renderInFront?: boolean;
  /**
   * When set, an outline is drawn around the
   * node to make it stand out.
   */
  readonly outline?: NodeAppearanceOutline;
};

export interface NodeAppearanceProvider {
  styleNode(treeIndex: number): NodeAppearance | undefined;
}

const OutlinedAppearance: NodeAppearance = {
  outline: { color: [255, 255, 255, 255], thickness: 4 }
};

const HiddenAppearance: NodeAppearance = {
  visible: false
};

const InFrontAppearance: NodeAppearance = {
  renderInFront: true
};

const HighlightedColorApperance: NodeAppearance = {
  color: [100, 100, 100, 255]
};

export const DefaultNodeAppearance = {
  NoOverrides: undefined as NodeAppearance | undefined,
  Outlined: OutlinedAppearance,
  Hidden: HiddenAppearance,
  InFront: InFrontAppearance,
  // TODO 2020-06-18 larsmoa: Add outline for Highlighted nodes
  Highlighted: { ...InFrontAppearance, ...HighlightedColorApperance /*,...OutlinedAppearance */ }
};
