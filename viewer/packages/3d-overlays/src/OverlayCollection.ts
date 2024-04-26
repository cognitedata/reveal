/*!
 * Copyright 2023 Cognite AS
 */

import type { Vector3, Color } from 'three';
import { Overlay3D } from './Overlay3D';

/**
 * The default metadata type contained in Overlays
 */
export type DefaultOverlay3DContentType = {
  [key: string]: string;
};

/**
 * Data used in creating an overlay.
 */
export type OverlayInfo<ContentType = DefaultOverlay3DContentType> = {
  /**
   * Position of the overlay
   */
  position: Vector3;
  /**
   * The data contained in this overlay
   */
  content: ContentType;
  /**
   * The color of this overlay. Will be set by collection if undefined
   */
  color?: Color;
};

/**
 * A set of overlays managed.
 */
export interface OverlayCollection<ContentType> {
  /**
   * Get all overlays in the collection.
   * */
  getOverlays(): Overlay3D<ContentType>[];

  /**
   * Add overlays to the collection.
   * @param overlays Overlays to add to the collection.
   * @returns The added overlays.
   */
  addOverlays(overlays: OverlayInfo<ContentType>[]): Overlay3D<ContentType>[];

  /**
   * Remove overlays from the collection.
   * @param overlays Overlays to remove from the collection.
   */
  removeOverlays(overlays: Overlay3D<ContentType>[]): void;

  /**
   * Remove all overlays from the collection.
   */
  removeAllOverlays(): void;

  /**
   * Sets whether overlays in the collection should be visible.
   */
  setVisibility(visibility: boolean): void;
}
