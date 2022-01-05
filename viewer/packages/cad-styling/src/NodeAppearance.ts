/*!
 * Copyright 2021 Cognite AS
 */

export enum NodeOutlineColor {
  NoOutline = 0,
  White,
  Black,
  Cyan,
  Blue,
  Green,
  Red,
  Orange
}

/**
 * Type for defining node appearance profiles to style a 3D CAD model.
 * @see {@link DefaultNodeAppearance}
 */
export type NodeAppearance = {
  /**
   * Overrides the default color of the node in RGB. Each component
   * is in range [0, 255]. `[0, 0, 0]` means no override.
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
  visible: true,
  outlineColor: NodeOutlineColor.White
};

const HiddenAppearance: NodeAppearance = {
  visible: false
};

const InFrontAppearance: NodeAppearance = {
  visible: true,
  renderInFront: true
};

const HighlightedColorAppearance: NodeAppearance = {
  visible: true,
  color: [100, 100, 255]
};

const GhostedAppearance: NodeAppearance = {
  visible: true,
  renderGhosted: true
};

const DefaultAppearance: NodeAppearance = {
  visible: true,
  renderGhosted: false,
  renderInFront: false,
  outlineColor: NodeOutlineColor.NoOutline,
  color: [0, 0, 0] as [number, number, number],
  prioritizedForLoadingHint: 0
};

/**
 * A set of default node appearances used in Reveal.
 */
export const DefaultNodeAppearance = {
  Default: DefaultAppearance,
  Outlined: OutlinedAppearance,
  Hidden: HiddenAppearance,
  InFront: InFrontAppearance,
  Ghosted: GhostedAppearance,
  Highlighted: { ...InFrontAppearance, ...HighlightedColorAppearance, ...OutlinedAppearance }
};
