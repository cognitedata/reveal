/*!
 * Copyright 2021 Cognite AS
 */

import { OccludingGeometryProvider } from '../sector/culling/OccludingGeometryProvider';
import { EffectRenderManager } from './EffectRenderManager';

export class RenderAlreadyLoadedGeometryProvider implements OccludingGeometryProvider {
  private readonly _renderManager: EffectRenderManager;

  constructor(renderManager: EffectRenderManager) {
    this._renderManager = renderManager;
  }

  renderOccludingGeometry(target: THREE.WebGLRenderTarget | null, camera: THREE.PerspectiveCamera): void {
    const original = {
      renderTarget: this._renderManager.getRenderTarget(),
      autoSize: this._renderManager.getRenderTargetAutoSize()
    };
    try {
      this._renderManager.setRenderTarget(target);
      this._renderManager.renderDetailedToDepthOnly(camera);
    } finally {
      this._renderManager.setRenderTarget(original.renderTarget);
      this._renderManager.setRenderTargetAutoSize(original.autoSize);
    }
  }
}
