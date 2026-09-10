import { Camera, CubeCamera, LinearMipMapLinearFilter, Object3D, WebGLCubeRenderTarget, WebGLRenderer } from 'three';
import { CadMaterialManager } from '../CadMaterialManager';
import { RenderPass } from '../RenderPass';
import { RenderMode } from './RenderMode';
import { getLayerMask } from '../utilities/renderUtilities';

export class CubemapPass implements RenderPass {
  private readonly _geometryScene: Object3D;
  private readonly _materialManager: CadMaterialManager;
  private readonly _cubeRenderTarget: WebGLCubeRenderTarget;
  private readonly _cubeCamera: CubeCamera;

  constructor(scene: Object3D, materialManager: CadMaterialManager) {
    this._geometryScene = scene;
    this._materialManager = materialManager;
    this._cubeRenderTarget = new WebGLCubeRenderTarget(64, { minFilter: LinearMipMapLinearFilter });
    this._cubeCamera = new CubeCamera(0.1, 100, this._cubeRenderTarget);
  }

  public render(renderer: WebGLRenderer, camera: Camera): void {
    const initialCameraMask = camera.layers.mask;
    const initialrenderMode = this._materialManager.getRenderMode();
    try {
      this._cubeCamera.position.copy(camera.position);

      const renderMask = getLayerMask(RenderMode.Color);
      this._cubeCamera.layers.mask = renderMask;
      this._materialManager.setRenderMode(RenderMode.BillboardsOnly);

      this._cubeCamera.update(renderer, this._geometryScene);
    } finally {
      this._materialManager.setRenderMode(initialrenderMode);
      camera.layers.mask = initialCameraMask;
    }
  }
}
