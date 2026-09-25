/*!
 * Copyright 2026 Cognite AS
 */

import type { Box3, Texture, WebGLRenderer } from 'three';
import {
  DepthFormat,
  DepthTexture,
  LessEqualCompare,
  LinearFilter,
  Matrix4,
  NearestFilter,
  OrthographicCamera,
  RedFormat,
  Sphere,
  UnsignedByteType,
  UnsignedIntType,
  Vector3,
  WebGLRenderTarget
} from 'three';
import type { SceneHandler } from '@reveal/utilities';
import type { CadMaterialManager } from '../CadMaterialManager';
import type { RenderPass } from '../RenderPass';
import { RenderMode } from '../rendering/RenderMode';
import { CAD_LIGHT_WORLD } from '../rendering/cadLighting';
import { getLayerMask, RenderLayer } from '../utilities/renderUtilities';
import { GeometryPass } from './GeometryPass';
import type { CadShadowMap } from '../render-pipeline-providers/types';

const SHADOW_MAP_RESOLUTION = 4096;

// Far enough back that the converging rays of ray-marched CAD primitives approximate a directional light.
const LIGHT_DISTANCE_IN_RADII = 200;
const WORLD_UP = new Vector3(0, 1, 0);
const WORLD_UP_ALTERNATIVE = new Vector3(0, 0, 1);

export class ShadowMapPass implements RenderPass, CadShadowMap {
  private readonly _renderTarget: WebGLRenderTarget;
  private readonly _depthTexture: DepthTexture;
  private readonly _lightCamera: OrthographicCamera;
  private readonly _geometryPass: GeometryPass;
  private readonly _matrix = new Matrix4();
  private readonly _center = new Vector3();
  private readonly _corner = new Vector3();
  private readonly _boundingSphere = new Sphere();
  private _texelWorldSize = 1;
  private _depthRange = 1;
  private _hasValidBounds = false;
  private _userEnabled: boolean;

  constructor(sceneHandler: SceneHandler, materialManager: CadMaterialManager, userEnabled: boolean = false) {
    this._userEnabled = userEnabled;
    this._renderTarget = new WebGLRenderTarget(SHADOW_MAP_RESOLUTION, SHADOW_MAP_RESOLUTION, {
      depthBuffer: true,
      stencilBuffer: false,
      magFilter: NearestFilter,
      minFilter: NearestFilter,
      format: RedFormat,
      type: UnsignedByteType
    });
    this._depthTexture = new DepthTexture(SHADOW_MAP_RESOLUTION, SHADOW_MAP_RESOLUTION);
    this._depthTexture.format = DepthFormat;
    this._depthTexture.type = UnsignedIntType;
    // Linear filtering with a compare function enables hardware PCF through sampler2DShadow.
    this._depthTexture.magFilter = LinearFilter;
    this._depthTexture.minFilter = LinearFilter;
    this._depthTexture.compareFunction = LessEqualCompare;
    this._renderTarget.depthTexture = this._depthTexture;

    this._lightCamera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);

    const layerMask = getLayerMask(RenderLayer.Back) | getLayerMask(RenderLayer.InFront);
    this._geometryPass = new GeometryPass(sceneHandler.scene, materialManager, RenderMode.DepthBufferOnly, layerMask);
  }

  public get depthTexture(): Texture {
    return this._depthTexture;
  }

  public get matrix(): Matrix4 {
    return this._matrix;
  }

  public get texelWorldSize(): number {
    return this._texelWorldSize;
  }

  public get depthRange(): number {
    return this._depthRange;
  }

  public get enabled(): boolean {
    return this._userEnabled && this._hasValidBounds;
  }

  public get userEnabled(): boolean {
    return this._userEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this._userEnabled = enabled;
  }

  public setCadBounds(bounds: Box3): void {
    this._hasValidBounds = !bounds.isEmpty();
    if (!this._hasValidBounds) {
      return;
    }

    bounds.getCenter(this._center);
    const radius = Math.max(bounds.getBoundingSphere(this._boundingSphere).radius, 0.5);

    this._lightCamera.position.copy(this._center).addScaledVector(CAD_LIGHT_WORLD, radius * LIGHT_DISTANCE_IN_RADII);
    this._lightCamera.up.copy(Math.abs(CAD_LIGHT_WORLD.y) > 0.95 ? WORLD_UP_ALTERNATIVE : WORLD_UP);
    this._lightCamera.lookAt(this._center);
    this._lightCamera.updateMatrixWorld(true);

    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;

    for (let i = 0; i < 8; i++) {
      this._corner.set(
        (i & 1) === 0 ? bounds.min.x : bounds.max.x,
        (i & 2) === 0 ? bounds.min.y : bounds.max.y,
        (i & 4) === 0 ? bounds.min.z : bounds.max.z
      );
      this._corner.applyMatrix4(this._lightCamera.matrixWorldInverse);

      minX = Math.min(minX, this._corner.x);
      maxX = Math.max(maxX, this._corner.x);
      minY = Math.min(minY, this._corner.y);
      maxY = Math.max(maxY, this._corner.y);
      minZ = Math.min(minZ, this._corner.z);
      maxZ = Math.max(maxZ, this._corner.z);
    }

    const padding = Math.max(radius * 0.02, 0.05);
    this._lightCamera.left = minX - padding;
    this._lightCamera.right = maxX + padding;
    this._lightCamera.bottom = minY - padding;
    this._lightCamera.top = maxY + padding;
    // Light view space looks down -Z, so the near plane is the least negative Z.
    this._lightCamera.near = Math.max(-maxZ - padding, 0.01);
    this._lightCamera.far = -minZ + padding;
    this._lightCamera.updateProjectionMatrix();

    this._matrix.multiplyMatrices(this._lightCamera.projectionMatrix, this._lightCamera.matrixWorldInverse);
    this._texelWorldSize = Math.max(
      (this._lightCamera.right - this._lightCamera.left) / SHADOW_MAP_RESOLUTION,
      (this._lightCamera.top - this._lightCamera.bottom) / SHADOW_MAP_RESOLUTION
    );
    this._depthRange = Math.max(this._lightCamera.far - this._lightCamera.near, 1e-4);
  }

  public render(renderer: WebGLRenderer): void {
    // Binding the target is what makes Three allocate it, so return before that.
    if (!this.enabled) {
      return;
    }

    renderer.setRenderTarget(this._renderTarget);
    this._geometryPass.render(renderer, this._lightCamera);
  }

  public dispose(): void {
    this._depthTexture.dispose();
    this._renderTarget.dispose();
  }
}
