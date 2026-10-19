/*!
 * Copyright 2026 Cognite AS
 */

import type { Box3, Camera, Texture, WebGLRenderer } from 'three';
import {
  DepthFormat,
  DepthTexture,
  Matrix4,
  NearestFilter,
  OrthographicCamera,
  PerspectiveCamera,
  RedFormat,
  Sphere,
  UnsignedByteType,
  UnsignedIntType,
  Vector3,
  WebGLRenderTarget
} from 'three';
import { isMobileOrTablet, type SceneHandler } from '@reveal/utilities';
import type { CadMaterialManager } from '../CadMaterialManager';
import type { RenderPass } from '../RenderPass';
import { RenderMode } from '../rendering/RenderMode';
import { CAD_LIGHT_WORLD } from '../rendering/cadLighting';
import { getLayerMask, RenderLayer } from '../utilities/renderUtilities';
import { GeometryPass } from './GeometryPass';
import type { CadShadowMap } from '../render-pipeline-providers/types';

const SHADOW_MAP_RESOLUTION = 4096;
const SHADOW_MAP_MOBILE_RESOLUTION = 2048;
// Far enough back that the converging rays of ray-marched CAD primitives approximate a directional light.
const LIGHT_DISTANCE_IN_RADII = 200;
const FOCUS_WINDOW_IN_FOCUS_DISTANCES = 8;
const FOCUS_REDRAW_THRESHOLD = 0.02;
const FOCUS_SPAN_STEP = Math.SQRT2;
const FOCUS_SPAN_HYSTERESIS = 0.15;
const WORLD_UP = new Vector3(0, 1, 0);
const WORLD_UP_ALTERNATIVE = new Vector3(0, 0, 1);

export function resolveShadowMapResolution(maxTextureSize: number, mobileOrTablet: boolean): number {
  const desired = mobileOrTablet ? SHADOW_MAP_MOBILE_RESOLUTION : SHADOW_MAP_RESOLUTION;
  if (!(maxTextureSize > 0)) {
    return desired;
  }
  return Math.min(desired, maxTextureSize);
}

export class ShadowMapPass implements RenderPass, CadShadowMap {
  private readonly _renderTarget: WebGLRenderTarget;
  private readonly _depthTexture: DepthTexture;
  private readonly _lightCamera: OrthographicCamera;
  private readonly _geometryPass: GeometryPass;
  private readonly _matrix = new Matrix4();
  private readonly _center = new Vector3();
  private readonly _corner = new Vector3();
  private readonly _rayOrigin = new Vector3();
  private readonly _rayDir = new Vector3();
  private readonly _hit = new Vector3();
  private readonly _focusPoint = new Vector3();
  private readonly _boundingSphere = new Sphere();
  private _hasFocus = false;
  private _focusDistance: number | undefined = undefined;
  private _renderedFocusDistance: number | undefined = undefined;
  private _focusReadbackPending = false;
  private _spanLevel: number | undefined = undefined;
  private _fullLeft = -1;
  private _fullRight = 1;
  private _fullBottom = -1;
  private _fullTop = 1;
  private _stableTexelWorldSize = 1;
  private _resolution = SHADOW_MAP_RESOLUTION;
  private _texelWorldSize = 1;
  private _depthRange = 1;
  private _hasValidBounds = false;
  private _userEnabled: boolean;
  private readonly _mobileOrTablet: boolean;

  constructor(
    sceneHandler: SceneHandler,
    materialManager: CadMaterialManager,
    userEnabled: boolean = false,
    mobileOrTablet: boolean = isMobileOrTablet()
  ) {
    this._userEnabled = userEnabled;
    this._mobileOrTablet = mobileOrTablet;
    // Three.js always allocates a color texture. DepthBufferOnly never writes it;
    // RedFormat is the smallest attachment the framebuffer allows. The targets stay
    // allocated until dispose(), so toggling shadows off does not pay for a reallocation.
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
    this._depthTexture.magFilter = NearestFilter;
    this._depthTexture.minFilter = NearestFilter;
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

  public get stableTexelWorldSize(): number {
    return this._stableTexelWorldSize;
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

  public setFocusPoint(point: Vector3 | null): void {
    if (point === null) {
      this._hasFocus = false;
      return;
    }
    this._focusPoint.copy(point);
    this._hasFocus = true;
  }

  public setFocusDistance(distance: number | undefined, readbackPending: boolean = false): void {
    this._focusDistance = distance !== undefined && distance > 0 ? distance : undefined;
    this._focusReadbackPending = readbackPending;
  }

  public get focusNeedsRedraw(): boolean {
    if (!this.enabled) {
      return false;
    }
    if (this._focusReadbackPending) {
      return true;
    }
    if (this._focusDistance === undefined) {
      return false;
    }
    if (this._renderedFocusDistance === undefined) {
      return true;
    }
    return (
      Math.abs(this._focusDistance - this._renderedFocusDistance) > this._renderedFocusDistance * FOCUS_REDRAW_THRESHOLD
    );
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

    this._fullLeft = this._lightCamera.left;
    this._fullRight = this._lightCamera.right;
    this._fullBottom = this._lightCamera.bottom;
    this._fullTop = this._lightCamera.top;
    this._matrix.multiplyMatrices(this._lightCamera.projectionMatrix, this._lightCamera.matrixWorldInverse);
    this.captureStableTexel();
    this._depthRange = Math.max(this._lightCamera.far - this._lightCamera.near, 1e-4);
  }

  public render(renderer: WebGLRenderer, camera?: Camera): void {
    // Binding the target is what makes Three allocate it, so return before that.
    if (!this.enabled) {
      return;
    }

    this.applyShadowMapResolution(renderer);
    if (camera !== undefined) {
      this.fitWindowToFocus(camera);
    }
    renderer.setRenderTarget(this._renderTarget);
    renderer.clear();
    this._geometryPass.render(renderer, this._lightCamera);
  }

  public dispose(): void {
    this._depthTexture.dispose();
    this._renderTarget.dispose();
  }

  private applyShadowMapResolution(renderer: WebGLRenderer): void {
    const resolution = resolveShadowMapResolution(renderer.capabilities.maxTextureSize, this._mobileOrTablet);
    if (resolution === this._resolution) {
      return;
    }

    this._resolution = resolution;
    // Resize before the first bind so the GPU never allocates the desktop map.
    this._renderTarget.setSize(resolution, resolution);
    if (this._hasValidBounds) {
      this.captureStableTexel();
    }
  }

  private fitWindowToFocus(camera: Camera): void {
    if (!(camera instanceof PerspectiveCamera)) {
      return;
    }
    const measured = this._focusDistance;
    if (measured === undefined && !this._hasFocus) {
      return;
    }

    // Prefer the probed view-ray distance; otherwise use the explicit focus point.
    camera.updateMatrixWorld();
    this._rayOrigin.setFromMatrixPosition(camera.matrixWorld);
    let focusDistance: number;
    if (measured !== undefined) {
      focusDistance = measured;
      this._renderedFocusDistance = measured;
      camera.getWorldDirection(this._rayDir);
      this._hit.copy(this._rayOrigin).addScaledVector(this._rayDir, focusDistance);
    } else {
      focusDistance = this._rayDir.copy(this._focusPoint).sub(this._rayOrigin).length();
      this._hit.copy(this._focusPoint);
    }
    if (!(focusDistance > 1e-4)) {
      return;
    }

    // Window side is a few focus-distances wide, held on sqrt(2) steps so it does not resize every frame.
    const fullW = this._fullRight - this._fullLeft;
    const fullH = this._fullTop - this._fullBottom;
    const fullSpan = Math.min(fullW, fullH);
    const span = this.quantizeSpan(focusDistance * FOCUS_WINDOW_IN_FOCUS_DISTANCES);
    if (!(span > 0) || span >= fullSpan) {
      return;
    }

    // Place that window on the light plane and snap its origin to a shadow texel.
    this._hit.applyMatrix4(this._lightCamera.matrixWorldInverse);
    const texel = span / Math.max(this._resolution, 1);
    let left = Math.min(Math.max(this._hit.x - span * 0.5, this._fullLeft), this._fullRight - span);
    let bottom = Math.min(Math.max(this._hit.y - span * 0.5, this._fullBottom), this._fullTop - span);
    left = Math.floor(left / texel) * texel;
    bottom = Math.floor(bottom / texel) * texel;

    // Publish the tighter frustum. The stable texel stays the full-plant size.
    this._lightCamera.left = left;
    this._lightCamera.right = left + span;
    this._lightCamera.bottom = bottom;
    this._lightCamera.top = bottom + span;
    this._lightCamera.updateProjectionMatrix();
    this._matrix.multiplyMatrices(this._lightCamera.projectionMatrix, this._lightCamera.matrixWorldInverse);
    this.updateTexelWorldSize();
  }

  private quantizeSpan(rawSpan: number): number {
    if (!(rawSpan > 0)) {
      return rawSpan;
    }
    const logStep = Math.log(FOCUS_SPAN_STEP);
    const exactLevel = Math.ceil(Math.log(rawSpan) / logStep);
    if (this._spanLevel === undefined) {
      this._spanLevel = exactLevel;
    } else {
      const upper = Math.exp(this._spanLevel * logStep);
      const lower = upper / FOCUS_SPAN_STEP;
      if (rawSpan > upper * (1 + FOCUS_SPAN_HYSTERESIS) || rawSpan < lower * (1 - FOCUS_SPAN_HYSTERESIS)) {
        this._spanLevel = exactLevel;
      }
    }
    return Math.exp(this._spanLevel * logStep);
  }

  private captureStableTexel(): void {
    this.updateTexelWorldSize();
    this._stableTexelWorldSize = this._texelWorldSize;
  }

  private updateTexelWorldSize(): void {
    this._texelWorldSize = Math.max(
      (this._lightCamera.right - this._lightCamera.left) / this._resolution,
      (this._lightCamera.top - this._lightCamera.bottom) / this._resolution
    );
  }
}
