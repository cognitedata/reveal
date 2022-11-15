/*!
 * Copyright 2021 Cognite AS
 */

import { Color } from 'three';

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
   * Overrides the default color of the node in RGB. Black,
   * or `new Color(0, 0, 0)` means no override.
   */
  readonly color?: Color;
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

  /**
   * When provided, this value can be used to prioritize certain areas of the
   * 3D model to be loaded. This can be useful to prioritize key objects in the
   * 3D model to always be loaded.
   *
   * When non-zero, sectors containing geometry in the vicinity of the prioritized
   * sectors are given an *extra* priority. Recommended values are in range 1 (somewhat
   * higher priority to be loaded) to 10 (very likely to be loaded). Usually values around 4-5
   * is recommended.
   *
   * Prioritized nodes are loaded at the expense of non-prioritized areas. There are no
   * guarantees that the nodes are actually loaded, and the more prioritized areas/nodes
   * provided, the less likely it is that the hint is obeyed.
   *
   * Extra priority doesn't accumulate when sectors are prioritized because they intersect/contain
   * several nodes.
   *
   * **This is an advanced feature and not recommended for most users**
   *
   * @version Only works with 3D models converted later than Q4 2021.
   */
  readonly prioritizedForLoadingHint?: number;
};

/**
 * Type that represents a {@link NodeAppearance} in a serializable format
 */
export type SerializableNodeAppearance = {
  /**
   * Color as an RGB number tuple, with values in the range [0, 255]
   */
  readonly color?: [number, number, number];
  /**
   * Visibility, @see {@link NodeAppearance}
   */
  readonly visible?: boolean;
  /**
   * Whether to render in front, @see {@link NodeAppearance}
   */
  readonly renderInFront?: boolean;
  /**
   * Whether to render ghosted, @see {@link NodeAppearance}
   */
  readonly renderGhosted?: boolean;
  /**
   * Outline color, @see {@link NodeAppearance}
   */
  readonly outlineColor?: NodeOutlineColor;

  /**
   * Prioritized loading hint, @see {@link NodeAppearance}
   */
  readonly prioritizedForLoadingHint?: number;
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
  renderGhosted: false,
  color: new Color(0.392, 0.392, 1.0)
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
  color: new Color('black'),
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
