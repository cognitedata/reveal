/*!
 * Copyright 2023 Cognite AS
 */
import { Overlay3D } from './Overlay3D';

export type DefaultMetadataType = {
  text?: string;
  [key: string]: any;
};

export type OverlayInfo<MetadataType = DefaultMetadataType> = {
  position: THREE.Vector3;
  metadata?: MetadataType;
  color?: THREE.Color;
};

export interface OverlayCollection<MetadataType> {
  /**
   * Get all overlays in the collection.
   * */
  getOverlays(): Overlay3D<MetadataType>[];

  /**
   * Add overlays to the collection.
   * @param overlays Overlays to add to the collection.
   */
  addOverlays(overlays: OverlayInfo<MetadataType>[]): Overlay3D<MetadataType>[];

  /**
   * Remove overlays from the collection.
   * @param overlays Overlays to remove from the collection.
   */
  removeOverlays(overlays: Overlay3D<MetadataType>[]): void;

  /**
   * Remove all overlays from the collection.
   */
  removeAllOverlays(): void;

  /**
   * Sets whether overlays in the collection should be visible.
   */
  setVisibility(visibility: boolean): void;
}
