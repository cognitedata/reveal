/*!
 * Copyright 2023 Cognite AS
 */
export interface Overlay3D<MetadataType> {
  /**
   * Set whether this overlay should be visible.
   * */
  set visible(visible: boolean);
  /**
   * Get whether this overlay is visible.
   */
  get visible(): boolean;
  /**
   * Get the position of this overlay.
   */
  get position(): THREE.Vector3;
  /**
   * Set the display color of this overlay.
   * */
  set color(color: THREE.Color);
  /**
   * Get the display color of this overlay.
   * */
  get color(): THREE.Color;
  /**
   * Get the metadata associated with this overlay.
   * */
  getMetadata(): MetadataType | undefined;
}
