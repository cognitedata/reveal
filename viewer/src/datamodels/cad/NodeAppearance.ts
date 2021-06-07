/*!
 * Copyright 2021 Cognite AS
 */

export enum NodeOutlineColor {
  NoOutline = 0,
  White,
  Black,
  Cyan,
  Blue,
  Purple,
  Pink,
  Orange
}

/**
 * Type for defining node appearance profiles to style a 3D CAD model.
 * @see {@link DefaultNodeAppearance}
 */
export type NodeAppearance = {
  /**
   * Overrides the default color of the node.
   */
  readonly color?: [number, number, number];
  /**
   * Overrides the visibility of the node.
   */
  readonly visible?: boolean;
  /**
   * When set to true, the node is rendered in front
   * of all other nodes even if it's occluded.
   * Note that this take precedence over {@link renderGhosted}.
   */
  readonly renderInFront?: boolean;
  /**
   * When set to true, the node is rendered ghosted, i.e.
   * transparent with a fixed color. This has no effect if {@link renderInFront}
   * is `true`.
   */
  readonly renderGhosted?: boolean;
  /**
   * When set, an outline is drawn around the
   * node to make it stand out.
   */
  readonly outlineColor?: NodeOutlineColor;
};

const OutlinedAppearance: NodeAppearance = {
  outlineColor: NodeOutlineColor.White
};

const HiddenAppearance: NodeAppearance = {
  visible: false
};

const InFrontAppearance: NodeAppearance = {
  renderInFront: true
};

const HighlightedColorAppearance: NodeAppearance = {
  color: [100, 100, 255]
};

const GhostedAppearance: NodeAppearance = {
  renderGhosted: true
};

/**
 * A set of default node appearances used in Reveal.
 */
export const DefaultNodeAppearance = {
  Default: { visible: true, renderGhosted: false, renderInFront: false, outlineColor: NodeOutlineColor.NoOutline },
  Outlined: OutlinedAppearance,
  Hidden: HiddenAppearance,
  InFront: InFrontAppearance,
  Ghosted: GhostedAppearance,
  Highlighted: { ...InFrontAppearance, ...HighlightedColorAppearance, ...OutlinedAppearance }
};
