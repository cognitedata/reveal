/*!
 * Copyright 2025
 */

import { Cognite3DViewer } from '@reveal/api';
import { DataSourceType } from '@reveal/data-providers';
import { MetricsLogger } from '@reveal/metrics';
import * as THREE from 'three';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';

type AnyPick = Awaited<ReturnType<Cognite3DViewer['getAnyIntersectionFromPixel']>>;

export type CursorSurfaceCircleOptions = {
  /**
   * On-screen radius of the inner ring in pixels when `sizeMode` is `'pixel'`.
   * When `sizeMode` is `'world'`, this is used to derive an equivalent world radius
   * at the first hit position if {@link CursorSurfaceCircleOptions.worldRadius} is not provided.
   */
  pixelRadius?: number;
  /**
   * Ring color. Accepts `THREE.Color`, hex string or numeric color.
   */
  color?: THREE.Color | string | number;
  /**
   * Relative stroke thickness of the inner ring as a fraction of its radius.
   * Ignored when {@link CursorSurfaceCircleOptions.strokePx} is provided.
   */
  thickness?: number; // relative thickness (fraction of radius)
  /**
   * Number of segments for the ring geometry.
   */
  segments?: number;
  /**
   * Pixel offset used when sampling neighbor picks to estimate a surface normal.
   */
  sampleRadiusPx?: number;
  /**
   * Enable verbose logging for debugging. Off by default.
   * Note: internal logs are stripped in production builds.
   */
  debug?: boolean;
  /**
   * Desired stroke thickness in pixels for the inner ring. When provided, it overrides
   * {@link CursorSurfaceCircleOptions.thickness}.
   */
  strokePx?: number; // desired stroke thickness in pixels (overrides thickness when provided)
  /**
   * Determines how the ring scales:
   * - `'pixel'`: constant on-screen radius independent of distance
   * - `'world'`: constant world-space radius (depth-aware)
   */
  sizeMode?: 'pixel' | 'world'; // pixel: constant on-screen size, world: constant world size (depth cue)
  /**
   * World-space radius to use when `sizeMode` is `'world'`. If omitted, an equivalent
   * world radius is derived at the first valid pick using {@link CursorSurfaceCircleOptions.pixelRadius}.
   */
  worldRadius?: number; // world radius when sizeMode='world'; if omitted, derived from first hit
  /**
   * Idle duration in milliseconds before the ring starts fading out.
   */
  fadeAfterMs?: number; // inactivity before fade starts (default: 1000ms)
  /**
   * Fade animation duration in milliseconds for both fade-in and fade-out.
   */
  fadeDurationMs?: number; // fade-out duration (default: 300ms)
  /**
   * If `true`, the ring only appears while a 360 image is active. If `false`, the ring can
   * appear over CAD/point cloud hits regardless of 360 state.
   */
  visibleOnlyIn360?: boolean; // when true, show only when an image360 is active (default: true)
};

/**
 * Renders a two-ring cursor indicator anchored to the surface under the mouse pointer.
 * The indicator supports pixel-locked and world-locked sizing, optional inactivity fading,
 * and can be restricted to only show while an Image360 is active.
 *
 * @example
 * ```ts
 * const cursor = new CursorSurfaceCircleTool(viewer, {
 *   sizeMode: 'world',
 *   strokePx: 8,
 *   visibleOnlyIn360: true
 * });
 * // ... later
 * cursor.visible(false); // hide
 * cursor.dispose();      // detach from viewer and free resources
 * ```
 */
export class CursorSurfaceCircleTool extends Cognite3DViewerToolBase {
  private readonly _viewer: Cognite3DViewer<DataSourceType>;
  private readonly _options: Required<CursorSurfaceCircleOptions>;
  private readonly _group: THREE.Group;
  private readonly _mesh: THREE.Mesh;
  private readonly _geometry: THREE.RingGeometry;
  private readonly _material: THREE.MeshBasicMaterial;
  private readonly _outerMesh: THREE.Mesh;
  private readonly _outerGeometry: THREE.RingGeometry;
  private readonly _outerMaterial: THREE.MeshBasicMaterial;
  private _enabled = true;
  private _rafScheduled = false;
  private _lastPointerEvent: PointerEvent | undefined;
  private _lastClientMouse: { x: number; y: number } | undefined;
  private readonly _zAxis = new THREE.Vector3(0, 0, 1);
  private readonly _tmpV2dx = new THREE.Vector2();
  private readonly _tmpV2dy = new THREE.Vector2();
  private readonly _p0 = new THREE.Vector3();
  private readonly _pX = new THREE.Vector3();
  private readonly _pY = new THREE.Vector3();
  private readonly _vx = new THREE.Vector3();
  private readonly _vy = new THREE.Vector3();
  private readonly _normal = new THREE.Vector3();
  private readonly _camPos = new THREE.Vector3();
  private readonly _relativeThickness: number;
  private readonly _sizeMode: 'pixel' | 'world';
  private _baseWorldRadius: number | undefined;
  private _lastActiveMs = 0;
  private readonly _fadeAfterMs: number;
  private readonly _fadeDurationMs: number;
  private _isFading = false;
  private _fadeStartMs = 0;
  private _isFadingIn = false;
  private _fadeInStartMs = 0;
  private readonly _visibleOnlyIn360: boolean;
  private _fadeTimer: number | undefined;
  private readonly _outerRelativeThickness: number;
  private _baseOuterWorldRadius: number | undefined;
  private readonly _gapPx: number;
  private readonly _outerStrokePx: number;

  private static readonly defaultOptions: Required<CursorSurfaceCircleOptions> = {
    pixelRadius: 16,
    color: new THREE.Color('white'),
    thickness: 0.02,
    segments: 64,
    sampleRadiusPx: 3,
    debug: false,
    strokePx: 0,
    sizeMode: 'pixel',
    worldRadius: 0,
    fadeAfterMs: 1000,
    fadeDurationMs: 300,
    visibleOnlyIn360: true
  };

  /**
   * Creates a new cursor surface circle tool and attaches it to the provided viewer.
   * @param viewer The {@link Cognite3DViewer} instance to attach to.
   * @param options Optional visualization and behavior settings.
   */
  constructor(viewer: Cognite3DViewer<DataSourceType>, options?: CursorSurfaceCircleOptions) {
    super();
    this._viewer = viewer;
    this._options = { 
        ...CursorSurfaceCircleTool.defaultOptions,
        ...options
    };
    this._sizeMode = this._options.sizeMode;
    this._fadeAfterMs = Math.max(0, this._options.fadeAfterMs);
    this._fadeDurationMs = Math.max(1, this._options.fadeDurationMs);
    this._visibleOnlyIn360 = this._options.visibleOnlyIn360;
    // Compute relative thickness. If strokePx provided, derive from pixelRadius; else use relative thickness option
    const clampedPixelRadius = Math.max(1, this._options.pixelRadius);
    let relative: number = this._options.thickness ?? 0.02;
    if (this._options.strokePx > 0 && isFinite(this._options.strokePx)) {
      const desiredStrokePx = Math.max(1, this._options.strokePx);
      relative = desiredStrokePx / clampedPixelRadius;
    }
    this._relativeThickness = Math.min(0.5, Math.max(0.01, relative));


    const color = new THREE.Color(this._options.color as any);
    this._group = new THREE.Group();
    this._group.name = CursorSurfaceCircleTool.name;
    this._group.visible = false;
    this._viewer.addObject3D(this._group);

    this._geometry = new THREE.RingGeometry(1 - this._relativeThickness, 1, this._options.segments);
    this._material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.75, depthTest: false, depthWrite: false, side: THREE.DoubleSide });
    this._mesh = new THREE.Mesh(this._geometry, this._material);
    this._mesh.visible = true;
    this._mesh.name = 'CursorSurfaceCircleToolInner';
    this._mesh.renderOrder = 9999;
    this._group.add(this._mesh);

    // Compute outer ring relative thickness based on inner stroke
    const innerStrokePx = this._options.strokePx > 0
      ? this._options.strokePx
      : Math.max(1, Math.round(this._options.pixelRadius * this._relativeThickness));
    this._gapPx = Math.max(1, Math.round(innerStrokePx / 4));
    this._outerStrokePx = Math.max(1, Math.round(innerStrokePx / 3));
    const outerPixelRadius = this._options.pixelRadius + this._gapPx + this._outerStrokePx;
    this._outerRelativeThickness = Math.min(0.5, Math.max(0.01, this._outerStrokePx / outerPixelRadius));

    // Outer ring
    this._outerGeometry = new THREE.RingGeometry(1 - this._outerRelativeThickness, 1, this._options.segments);
    this._outerMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1, depthTest: false, depthWrite: false, side: THREE.DoubleSide });
    this._outerMesh = new THREE.Mesh(this._outerGeometry, this._outerMaterial);
    this._outerMesh.visible = true;
    this._outerMesh.name = 'CursorSurfaceCircleToolOuter';
    this._outerMesh.renderOrder = 9999;
    this._group.add(this._outerMesh);

    this.onSceneRendered = this.onSceneRendered.bind(this);

    this._viewer.domElement.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('mousemove', this.onWindowMouseMove, { passive: true });
    this._viewer.on('sceneRendered', this.onSceneRendered);

    MetricsLogger.trackCreateTool('CursorSurfaceCircleTool');
  }

  /**
   * Disposes the tool and frees allocated resources. Detaches event listeners
   * and removes the underlying THREE objects from the viewer.
   */
  public dispose(): void {
    this._viewer.domElement.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('mousemove', this.onWindowMouseMove);
    this._viewer.off('sceneRendered', this.onSceneRendered);
    this._group.clear();
    this._viewer.removeObject3D(this._group);
    this._geometry.dispose();
    this._material.dispose();
    this._outerGeometry.dispose();
    this._outerMaterial.dispose();
    super.dispose();
    if (this._fadeTimer !== undefined) {
      clearTimeout(this._fadeTimer);
      this._fadeTimer = undefined as any;
    }
  }

  /**
   * Sets the visibility state of the cursor tool.
   * For convenience, {@link CursorSurfaceCircleTool.visible} provides the same behavior.
   * @param visible `true` to show, `false` to hide.
   */
  public setVisible(visible: boolean): void {
    this._enabled = visible;
    if (!visible) {
      this._group.visible = false;
      if (this._fadeTimer !== undefined) {
        clearTimeout(this._fadeTimer);
        this._fadeTimer = undefined as any;
      }
    }
  }

  /**
   * Convenience wrapper for {@link CursorSurfaceCircleTool.setVisible}.
   * @param enable `true` to show, `false` to hide.
   */
  public visible(enable: boolean): void {
    this.setVisible(enable);
  }

  private scheduleRafUpdate(): void {
    if (this._rafScheduled) return;
    this._rafScheduled = true;
    requestAnimationFrame(() => {
      this._rafScheduled = false;
      void this.updateFromLastEvent();
    });
  }

  private onPointerMove = (event: PointerEvent): void => {
    this._lastPointerEvent = event;
    this.scheduleRafUpdate();
  };

  private onWindowMouseMove = (event: MouseEvent): void => {
    this._lastClientMouse = { x: event.clientX, y: event.clientY };
    this.scheduleRafUpdate();
  };

  private onSceneRendered(): void {
    // Keep pixel radius consistent while camera moves
    if (this._group.visible) {
      // Hide immediately if gating to 360 and we have exited 360 mode
      if (!this.canRender()) {
        this._group.visible = false;
        this._viewer.requestRedraw();
        return;
      }
      this.updateScaleOnly();
      // Handle inactivity fade-out
      const now = performance.now();
      if (!this._isFading && now - this._lastActiveMs > this._fadeAfterMs) {
        this._isFading = true;
        this._fadeStartMs = now;
        this._viewer.requestRedraw();
      }
      // Handle fade-in animation
      if (this._isFadingIn) {
        const tIn = (now - this._fadeInStartMs) / this._fadeDurationMs;
        const opacityIn = Math.min(1, tIn);
        this._material.opacity = 0.75 * opacityIn;
        this._outerMaterial.opacity = opacityIn;
        this._viewer.requestRedraw();
        if (opacityIn >= 1) {
          this._isFadingIn = false;
          this._material.opacity = 0.75;
          this._outerMaterial.opacity = 1;
        }
      }
      if (this._isFading) {
        const t = (now - this._fadeStartMs) / this._fadeDurationMs;
        const opacity = Math.max(0, 1 - t);
        this._material.opacity = 0.75 * opacity;
        this._outerMaterial.opacity = opacity;
        this._viewer.requestRedraw();
        if (opacity <= 0) {
          this._group.visible = false;
          this._isFading = false;
          this._material.opacity = 0.75;
          this._outerMaterial.opacity = 1;
        }
      }
    }
  }

  private async updateFromLastEvent(): Promise<void> {
    const event = this._lastPointerEvent;
    if (!this._enabled) {
      return;
    }
    // Always allow circle when a valid 3D hit exists (CAD or point cloud)
    if (!this.canRender()) {
      this._group.visible = false;
      this._viewer.requestRedraw();
      return;
    }

    // Primary pick
    let pixel: THREE.Vector2;
    if (event !== undefined) {
      pixel = this._viewer.getPixelCoordinatesFromEvent(event);
    } else if (this._lastClientMouse !== undefined) {
      const rect = this._viewer.canvas.getBoundingClientRect();
      pixel = new THREE.Vector2(
        this._lastClientMouse.x - rect.left,
        this._lastClientMouse.y - rect.top
      );
    } else {
      return;
    }
    const hit = await this.pick(pixel);
    if (!hit) {
      // If inside 360, still show the circle by projecting along camera ray
      if (this._visibleOnlyIn360 && this._viewer.getActive360ImageInfo() !== undefined) {
        const camera = this._viewer.cameraManager.getCamera();
        const canvas = this._viewer.canvas;
        const ndcX = (pixel.x / canvas.clientWidth) * 2 - 1;
        const ndcY = -(pixel.y / canvas.clientHeight) * 2 + 1;
        const camPos = new THREE.Vector3();
        camera.getWorldPosition(camPos);
        const worldPoint = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera);
        const dir = worldPoint.sub(camPos).normalize();
        const fallbackDistance = 3.0;
        this._p0.copy(camPos).addScaledVector(dir, fallbackDistance);
        // Face camera on 360 fallback
        camera.getWorldDirection(this._normal).multiplyScalar(-1).normalize();

        const epsilon = 2e-2;
        this._group.position.copy(this._p0).addScaledVector(this._normal, epsilon);
        this._group.quaternion.setFromUnitVectors(this._zAxis, this._normal);
        this.updateScaleOnly();
        this._group.visible = true;
        this._lastActiveMs = performance.now();
        if (this._isFading) {
          this._isFading = false;
          this._isFadingIn = true;
          this._fadeInStartMs = performance.now();
          this._material.opacity = 0;
          this._outerMaterial.opacity = 0;
        }
        this.scheduleFadeCheck();
        this._viewer.requestRedraw();
        return;
      }
      this._group.visible = false;
      this._viewer.requestRedraw();
      return;
    }

    this._p0.copy(hit.point);

    // Approximate normal from neighboring samples (fallback to camera-facing)
    const sampleDeltaPx = this._options.sampleRadiusPx;
    this._tmpV2dx.set(pixel.x + sampleDeltaPx, pixel.y);
    this._tmpV2dy.set(pixel.x, pixel.y + sampleDeltaPx);

    const [hitX, hitY] = await Promise.all([this.pick(this._tmpV2dx), this.pick(this._tmpV2dy)]);
    let usedNormal = false;
    if (hitX && hitY) {
      this._pX.copy(hitX.point);
      this._pY.copy(hitY.point);
      this._vx.subVectors(this._pX, this._p0);
      this._vy.subVectors(this._pY, this._p0);
      this._normal.crossVectors(this._vx, this._vy);
      if (this._normal.lengthSq() > 1e-10) {
        this._normal.normalize();
        usedNormal = true;
      }
    }

    const camera = this._viewer.cameraManager.getCamera();
    if (!usedNormal) {
      // Face camera if normal not available
      camera.getWorldDirection(this._normal).multiplyScalar(-1).normalize();
    }

    // Position and orientation
    const epsilon = 2e-2;
    this._group.position.copy(this._p0).addScaledVector(this._normal, epsilon);
    this._group.quaternion.setFromUnitVectors(this._zAxis, this._normal);

    // Scale depending on size mode
    if (this._sizeMode === 'world') {
      if (this._baseWorldRadius === undefined) {
        this._baseWorldRadius = this._options.worldRadius > 0
          ? this._options.worldRadius
          : this._options.pixelRadius * this.pixelToWorldScaleAt(this._group.position);
      }
    }
    this.updateScaleOnly();

    this._group.visible = true;
    // Reset fade state and mark activity
    this._lastActiveMs = performance.now();
    if (this._isFading) {
      this._isFading = false;
      this._isFadingIn = true;
      this._fadeInStartMs = performance.now();
      this._material.opacity = 0;
      this._outerMaterial.opacity = 0;
    }
    this.scheduleFadeCheck();
    this._viewer.requestRedraw();
  }

  private updateScaleOnly(): void {
    const pixelToWorld = this.pixelToWorldScaleAt(this._group.position);
    const uniformScale = this._sizeMode === 'world'
      ? (this._baseWorldRadius ?? this._options.pixelRadius * pixelToWorld)
      : this._options.pixelRadius * pixelToWorld;
    this._mesh.scale.set(uniformScale, uniformScale, uniformScale);

    // Outer scale derived by gap and stroke
    let outerScale: number;
    if (this._sizeMode === 'world') {
      if (this._baseOuterWorldRadius === undefined) {
        const innerBase = (this._baseWorldRadius ?? this._options.pixelRadius * pixelToWorld);
        this._baseOuterWorldRadius = innerBase + (this._gapPx + this._outerStrokePx) * pixelToWorld;
      }
      outerScale = this._baseOuterWorldRadius!;
    } else {
      const outerPixelRadiusNow = this._options.pixelRadius + this._gapPx + this._outerStrokePx;
      outerScale = outerPixelRadiusNow * pixelToWorld;
    }
    this._outerMesh.scale.set(outerScale, outerScale, outerScale);
  }

  private scheduleFadeCheck(): void {
    if (this._fadeTimer !== undefined) {
      clearTimeout(this._fadeTimer);
    }
    this._fadeTimer = window.setTimeout(() => {
      this._viewer.requestRedraw();
    }, this._fadeAfterMs + 16);
  }

  private async pick(pixel: THREE.Vector2): Promise<Extract<NonNullable<AnyPick>, { type: 'cad' | 'pointcloud' }> | undefined> {
    const result = await this._viewer.getAnyIntersectionFromPixel(pixel, { stopOnHitting360Icon: true });
    if (result && (result.type === 'cad' || result.type === 'pointcloud')) {
      return result as Extract<NonNullable<AnyPick>, { type: 'cad' | 'pointcloud' }>;
    }
    return undefined;
  }

  private is360Active(): boolean {
    return this._viewer.getActive360ImageInfo() !== undefined;
  }

  private canRender(): boolean {
    return !this._visibleOnlyIn360 || this.is360Active();
  }

  private pixelToWorldScaleAt(position: THREE.Vector3): number {
    const camera = this._viewer.cameraManager.getCamera();
    const canvas = this._viewer.canvas;
    camera.getWorldPosition(this._camPos);
    const distance = this._camPos.distanceTo(position);
    const worldHeightAtDist = 2 * distance * Math.tan((camera.fov * Math.PI) / 180 / 2);
    return worldHeightAtDist / canvas.clientHeight;
  }
}


