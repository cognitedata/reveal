/*!
 * Copyright 2021 Cognite AS
 */

export interface AlreadyLoadedGeometryDepthTextureProvider {
  renderDepthToTarget(target: THREE.WebGLRenderTarget | null, camera: THREE.PerspectiveCamera): void;
}
