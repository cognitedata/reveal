/*!
 * Copyright 2026 Cognite AS
 */

import type { Matrix4, PerspectiveCamera } from 'three';
import { Vector3 } from 'three';
import type { Overlay3DIcon } from '@reveal/3d-overlays';
import { worldToViewportCoordinates } from '@reveal/utilities';
import type { ClusteredIconData, ClusterRenderParams, ClusterScreenInfo } from './ClusterRenderingStrategy';
import type { HtmlClusterRendererOptions } from '../../types';
import { ClusterOverlayPointsObject } from './ClusterOverlayPointsObject';
import { createClusterSpriteTextures, type ClusterSpriteTextures } from './clusterSpriteTextures';

const DEFAULT_MIN_PIXEL_SIZE = 48;
const DEFAULT_MAX_PIXEL_SIZE = 120;
const DEFAULT_BASE_SIZE = 4000;
const DEFAULT_CLUSTER_RADIUS = 1.65;

export type SpriteClusterRendererOptions = HtmlClusterRendererOptions & {
  textures?: ClusterSpriteTextures;
  minPixelSize?: number;
  maxPixelSize?: number;
  radius?: number;
  maxClusters?: number;
};

/**
 * GPU cluster renderer. Uses the same Points + custom-shader path as POI overlays,
 * compositing SVG digit sprites from an atlas so counts stay sharp without HTML.
 */
export class SpriteClusterRenderer {
  private readonly _pointsObject: ClusterOverlayPointsObject;
  private readonly _ownedTextures: ClusterSpriteTextures | undefined;
  private readonly _enableHoverAnimations: boolean;
  private readonly _baseSize: number = DEFAULT_BASE_SIZE;
  private readonly _minSize: number;
  private readonly _maxSize: number;
  private readonly _clusterFadeStartDistance: number;
  private readonly _clusterFadeEndDistance: number;

  private _hoveredClusterIcon: Overlay3DIcon | undefined = undefined;
  private _isVisible: boolean = true;
  private _stagedScreenInfos: ClusterScreenInfo[] = [];

  constructor(options: SpriteClusterRendererOptions = {}) {
    this._enableHoverAnimations = options.enableHoverAnimations ?? true;
    this._clusterFadeStartDistance = options.clusterFadeStartDistance ?? 20;
    this._clusterFadeEndDistance = options.clusterFadeEndDistance ?? 150;
    this._minSize = options.minPixelSize ?? DEFAULT_MIN_PIXEL_SIZE;
    this._maxSize = options.maxPixelSize ?? DEFAULT_MAX_PIXEL_SIZE;

    const textures = options.textures ?? createClusterSpriteTextures();
    this._ownedTextures = options.textures === undefined ? textures : undefined;

    this._pointsObject = new ClusterOverlayPointsObject(options.maxClusters ?? 10000, {
      textures,
      minPixelSize: this._minSize,
      maxPixelSize: this._maxSize,
      radius: options.radius ?? DEFAULT_CLUSTER_RADIUS
    });
  }

  public get object3D(): ClusterOverlayPointsObject {
    return this._pointsObject;
  }

  public prepareClusters(visibleClusters: ClusteredIconData[], params: ClusterRenderParams): void {
    const { renderer, camera, modelTransform } = params;

    if (!this._isVisible) {
      this._stagedScreenInfos = [];
      this._pointsObject.setClusters([]);
      return;
    }

    this._stagedScreenInfos = this.computeClusterScreenInfos(
      visibleClusters,
      camera,
      modelTransform,
      renderer.domElement
    );
    this._pointsObject.setTransform(modelTransform);
  }

  public getStagedScreenInfos(): ClusterScreenInfo[] {
    return this._stagedScreenInfos;
  }

  public applyWithOcclusion(occludedIcons: Set<Overlay3DIcon>): void {
    if (!this._isVisible) {
      return;
    }

    const clusters = [];
    for (const info of this._stagedScreenInfos) {
      const fadeOpacity = occludedIcons.has(info.data.icon) ? this.computeFadeOpacity(info.distance) : 1;
      if (fadeOpacity === 0) {
        continue;
      }

      clusters.push({
        position: info.data.clusterPosition,
        clusterSize: info.data.clusterSize,
        opacity: fadeOpacity,
        hover: this._enableHoverAnimations && info.data.icon === this._hoveredClusterIcon ? 1 : 0
      });
    }

    this._pointsObject.setClusters(clusters);
  }

  public setHoveredCluster(icon: Overlay3DIcon | undefined): void {
    this._hoveredClusterIcon = icon;
  }

  public getHoveredCluster(): Overlay3DIcon | undefined {
    return this._hoveredClusterIcon;
  }

  public setVisible(visible: boolean): void {
    this._isVisible = visible;
    this._pointsObject.visible = visible;
    if (!visible) {
      this._stagedScreenInfos = [];
      this._pointsObject.setClusters([]);
      this._hoveredClusterIcon = undefined;
    }
  }

  public setOpacity(value: number): void {
    this._pointsObject.setOpacity(value);
  }

  public setOccludedVisible(value: boolean): void {
    this._pointsObject.setBackPointsVisible(value);
  }

  public setTransform(transform: Matrix4): void {
    this._pointsObject.setTransform(transform);
  }

  public dispose(): void {
    this._pointsObject.dispose();
    this._ownedTextures?.ring.dispose();
    this._ownedTextures?.ringHover.dispose();
    this._ownedTextures?.digitAtlas.dispose();
  }

  private computeClusterScreenInfos(
    visibleClusters: ClusteredIconData[],
    camera: PerspectiveCamera,
    modelTransform: Matrix4,
    canvas: HTMLCanvasElement
  ): ClusterScreenInfo[] {
    const result: ClusterScreenInfo[] = [];
    const tempWorldPos = new Vector3();
    const tempProjected = new Vector3();

    for (const clusterData of visibleClusters) {
      if (!clusterData.isCluster) {
        continue;
      }

      tempWorldPos.copy(clusterData.clusterPosition).applyMatrix4(modelTransform);
      const distance = camera.position.distanceTo(tempWorldPos);
      const projectedSize = Math.max(this._minSize, Math.min(this._maxSize, this._baseSize / Math.max(distance, 1)));
      const screenPos = worldToViewportCoordinates(canvas, camera, tempWorldPos, tempProjected).clone();

      result.push({
        data: clusterData,
        screenPos,
        worldPos: tempWorldPos.clone(),
        distance,
        projectedSize
      });
    }

    return result;
  }

  private computeFadeOpacity(distance: number): number {
    if (distance <= this._clusterFadeStartDistance) {
      return 1;
    }
    if (distance >= this._clusterFadeEndDistance) {
      return 0;
    }
    const range = this._clusterFadeEndDistance - this._clusterFadeStartDistance;
    return 1 - (distance - this._clusterFadeStartDistance) / range;
  }
}
