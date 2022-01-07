/*!
 * Copyright 2022 Cognite AS
 */

export interface OccludingGeometryProvider {
  renderOccludingGeometry(target: THREE.WebGLRenderTarget | null, camera: THREE.PerspectiveCamera): void;
}
