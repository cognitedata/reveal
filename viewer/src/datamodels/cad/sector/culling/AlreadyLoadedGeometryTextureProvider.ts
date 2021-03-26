/*!
 * Copyright 2021 Cognite AS
 */

export interface AlreadyLoadedGeometryDepthTextureProvider {
  provideAlreadyLoadedDepthTexture(): THREE.DepthTexture;
}
