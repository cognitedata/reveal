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

/**
 * The frustum is fitted to the whole model, so this is the only knob for texel density.
 * The pass is depth-only and CAD rendering here is draw-call bound rather than fill bound,
 * so raising the resolution costs far less than adding screen-space filtering passes.
 */
const SHADOW_MAP_RESOLUTION = 4096;

/**
 * How far back the light camera sits, in bounding sphere radii.
 *
 * The projection is orthographic, but the ray marched CAD primitives intersect against
 * rays that converge on the camera origin, and their vertex shaders orient the billboard
 * towards `cameraPosition`. Close to the model those rays fan out by tens of degrees, so
 * the shadow map records a point light silhouette while the lookup decodes it as a
 * parallel one, and shadows of curved primitives bend away from the light direction.
 *
 * Pulling the camera back makes the perspective assumption true to within atan(1 / this).
 * It costs nothing in depth precision: an orthographic depth range is far minus near,
 * which stays at twice the radius no matter how far back the camera goes.
 */
const LIGHT_DISTANCE_IN_RADII = 200;
const WORLD_UP = new Vector3(0, 1, 0);
const WORLD_UP_ALTERNATIVE = new Vector3(0, 0, 1);

/**
 * Renders CAD depth as seen from the CAD sun into a shadow map.
 *
 * The light camera is fitted to the CAD world bounds only, never to the view camera,
 * so the resulting shadows are view independent and stay put while the camera moves.
 */
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
  private _enabled = false;

  constructor(sceneHandler: SceneHandler, materialManager: CadMaterialManager) {
    this._renderTarget = new WebGLRenderTarget(SHADOW_MAP_RESOLUTION, SHADOW_MAP_RESOLUTION, {
      depthBuffer: true,
      stencilBuffer: false,
      magFilter: NearestFilter,
      minFilter: NearestFilter,
      // Three always allocates a colour attachment, but this pass never writes colour.
      // A single 8 bit channel keeps it from costing more memory than the depth itself.
      format: RedFormat,
      type: UnsignedByteType
    });
    this._depthTexture = new DepthTexture(SHADOW_MAP_RESOLUTION, SHADOW_MAP_RESOLUTION);
    this._depthTexture.format = DepthFormat;
    this._depthTexture.type = UnsignedIntType;
    // Linear filtering plus a compare function makes the sampler a sampler2DShadow, so the
    // texture unit does the depth comparison and returns a bilinearly filtered occlusion
    // ratio. Every tap is then a smooth value instead of a binary one, for free.
    this._depthTexture.magFilter = LinearFilter;
    this._depthTexture.minFilter = LinearFilter;
    this._depthTexture.compareFunction = LessEqualCompare;
    this._renderTarget.depthTexture = this._depthTexture;

    this._lightCamera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);

    // DepthBufferOnly disables color writes on the CAD materials, so this is a depth-only pass.
    const layerMask = getLayerMask(RenderLayer.Back) | getLayerMask(RenderLayer.InFront);
    this._geometryPass = new GeometryPass(
      sceneHandler.scene,
      materialManager,
      RenderMode.DepthBufferOnly,
      layerMask
    );
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
    return this._enabled;
  }

  /**
   * Fits the light frustum to the CAD bounds. Called every frame because sectors stream in,
   * but it only depends on geometry, never on the view camera.
   */
  public setCadBounds(bounds: Box3): void {
    this._enabled = !bounds.isEmpty();
    if (!this._enabled) {
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
    renderer.setRenderTarget(this._renderTarget);
    if (!this._enabled) {
      renderer.clear();
      return;
    }

    this._geometryPass.render(renderer, this._lightCamera);
  }

  public dispose(): void {
    this._depthTexture.dispose();
    this._renderTarget.dispose();
  }
}
