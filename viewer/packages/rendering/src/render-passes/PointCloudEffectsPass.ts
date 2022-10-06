/*!
 * Copyright 2022 Cognite AS
 */
import { WebGLRendererStateHelper } from '@reveal/utilities';
import * as THREE from 'three';
import { RenderPass } from '../RenderPass';
import { getLayerMask, RenderLayer, setRendererParameters } from '../utilities/renderUtilities';
import { PointCloudPassParameters } from './types';
import { PointCloudMaterialManager } from '../PointCloudMaterialManager';

export class PointCloudEffectsPass implements RenderPass {
  private readonly _viewerScene: THREE.Object3D;
  private readonly _pointCloudMaterialManager: PointCloudMaterialManager;
  private readonly _passMaterialParameters: PointCloudPassParameters;

  constructor(
    scene: THREE.Object3D,
    pointCloudMaterialManager: PointCloudMaterialManager,
    materialParameters?: PointCloudPassParameters
  ) {
    this._viewerScene = scene;
    this._pointCloudMaterialManager = pointCloudMaterialManager;
    this._passMaterialParameters = materialParameters ?? {};
  }

  public render(renderer: THREE.WebGLRenderer, camera: THREE.Camera): void {
    const currentCameraMask = camera.layers.mask;
    const rendererStateHelper = new WebGLRendererStateHelper(renderer);
    try {
      camera.layers.mask = getLayerMask(RenderLayer.PointCloud);

      this._pointCloudMaterialManager.setModelsMaterialParameters(this._passMaterialParameters?.material);

      setRendererParameters(rendererStateHelper, this._passMaterialParameters);

      renderer.render(this._viewerScene, camera);
    } finally {
      rendererStateHelper.resetState();

      camera.layers.mask = currentCameraMask;
    }
  }
}
