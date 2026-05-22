/*!
 * Copyright 2026 Cognite AS
 */

import { Matrix4, PerspectiveCamera, Vector3 } from 'three';
import { Overlay3DIcon } from '@reveal/3d-overlays';
import { ClusteredIconData, ClusterRenderParams, ClusterScreenInfo } from './ClusterRenderingStrategy';
import { worldToViewportCoordinates } from '@reveal/utilities';
import { generateClusterStyles } from './htmlClusterStyles';
import { HtmlClusterRendererOptions } from '../../types';

/** HTML-based cluster rendering for high-definition text display */
export class HtmlClusterRenderer {
  private readonly _container: HTMLDivElement;
  private readonly _elementPool: HTMLDivElement[] = [];
  private readonly _activeElements: Map<Overlay3DIcon, HTMLDivElement> = new Map();
  private readonly _maxPoolSize: number;
  private readonly _classPrefix: string;
  private readonly _enableHoverAnimations: boolean;
  private readonly _zIndex: number | undefined;
  private readonly _countSpanName: string;
  private readonly _baseSize: number = 4000;
  private readonly _minSize: number = 48;
  private readonly _maxSize: number = 120;
  private readonly _clusterFadeStartDistance: number;
  private readonly _clusterFadeEndDistance: number;

  private readonly _pendingReleaseTimeouts = new Set<ReturnType<typeof setTimeout>>();

  private _hoveredClusterIcon: Overlay3DIcon | undefined = undefined;
  private _isVisible: boolean = true;
  private _isAttached: boolean = false;
  private _domElement: HTMLElement | undefined = undefined;

  private _stagedScreenInfos: ClusterScreenInfo[] = [];
  private _stagedCanvas: HTMLCanvasElement | undefined = undefined;

  constructor(options: HtmlClusterRendererOptions = {}) {
    this._maxPoolSize = options.maxPoolSize ?? 100;
    this._classPrefix = options.classPrefix ?? 'reveal-cluster';
    this._countSpanName = `${this._classPrefix}-count`;
    this._enableHoverAnimations = options.enableHoverAnimations ?? true;
    this._zIndex = options.zIndex;
    this._clusterFadeStartDistance = options.clusterFadeStartDistance ?? 20;
    this._clusterFadeEndDistance = options.clusterFadeEndDistance ?? 150;
    this._container = this.createContainer();
    this.injectStyles();
  }

  // Computes screen-space data and manages element lifecycle. Must be followed by applyWithOcclusion() to complete the DOM update.
  public prepareClusters(visibleClusters: ClusteredIconData[], params: ClusterRenderParams): void {
    const { renderer, camera, modelTransform } = params;

    if (!this._isVisible) {
      this._stagedScreenInfos = [];
      this._stagedCanvas = undefined;
      return;
    }

    this.ensureAttached(renderer.domElement);
    this.updateContainerSize(renderer.domElement);

    const canvas = renderer.domElement;
    this._stagedScreenInfos = this.computeClusterScreenInfos(visibleClusters, camera, modelTransform, canvas);
    this._stagedCanvas = canvas;

    const visibleIcons = new Set<Overlay3DIcon>();
    for (const info of this._stagedScreenInfos) {
      visibleIcons.add(info.data.icon);
      if (!this._activeElements.has(info.data.icon)) {
        const element = this.acquireElement();
        this._activeElements.set(info.data.icon, element);
      }
    }

    for (const [icon, element] of this._activeElements.entries()) {
      if (!visibleIcons.has(icon)) {
        this.releaseElement(element);
        this._activeElements.delete(icon);
      }
    }
  }

  // Returns the screen-space info computed during the last prepareClusters call.
  public getStagedScreenInfos(): ClusterScreenInfo[] {
    return this._stagedScreenInfos;
  }

  // Applies DOM positions and fade opacity using a globally-computed occlusion set.
  public applyWithOcclusion(occludedIcons: Set<Overlay3DIcon>): void {
    if (!this._isVisible || !this._stagedCanvas) {
      return;
    }
    for (const info of this._stagedScreenInfos) {
      const element = this._activeElements.get(info.data.icon);
      if (element) {
        this.applyClusterElementUpdate(element, info, occludedIcons.has(info.data.icon), this._stagedCanvas);
      }
    }
  }

  public setHoveredCluster(icon: Overlay3DIcon | undefined): void {
    const previousHovered = this._hoveredClusterIcon;
    this._hoveredClusterIcon = icon;

    if (previousHovered !== undefined && previousHovered !== icon) {
      const prevElement = this._activeElements.get(previousHovered);
      if (prevElement) {
        this.setElementHovered(prevElement, false);
      }
    }

    if (icon !== undefined) {
      const element = this._activeElements.get(icon);
      if (element) {
        this.setElementHovered(element, true);
      }
    }
  }

  public getHoveredCluster(): Overlay3DIcon | undefined {
    return this._hoveredClusterIcon;
  }

  public setVisible(visible: boolean): void {
    this._isVisible = visible;
    if (visible) {
      this._container.style.display = 'block';
    } else {
      this.clearAllElements();
      this._container.style.display = 'none';
    }
  }

  private clearAllElements(): void {
    for (const timeoutId of this._pendingReleaseTimeouts) {
      clearTimeout(timeoutId);
    }
    this._pendingReleaseTimeouts.clear();

    for (const element of this._activeElements.values()) {
      element.style.display = 'none';
      element.remove();
      if (this._elementPool.length < this._maxPoolSize) {
        this._elementPool.push(element);
      }
    }
    this._activeElements.clear();
    this._hoveredClusterIcon = undefined;
  }

  public dispose(): void {
    for (const timeoutId of this._pendingReleaseTimeouts) {
      clearTimeout(timeoutId);
    }
    this._pendingReleaseTimeouts.clear();

    for (const element of this._activeElements.values()) {
      element.remove();
    }
    this._activeElements.clear();

    for (const element of this._elementPool) {
      element.remove();
    }
    this._elementPool.length = 0;

    this._container.remove();
    this._isAttached = false;
    this._domElement = undefined;
  }

  private createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = `${this._classPrefix}-container`;
    container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
    `;
    if (this._zIndex !== undefined) {
      container.style.zIndex = String(this._zIndex);
    }
    return container;
  }

  private injectStyles(): void {
    const style = document.createElement('style');
    style.textContent = generateClusterStyles(this._classPrefix);
    this._container.appendChild(style);
  }

  private ensureAttached(canvas: HTMLCanvasElement): void {
    const parent = canvas.parentElement;
    if (!parent) {
      return;
    }

    if (this._isAttached && this._domElement === parent) {
      return;
    }

    const parentStyle = getComputedStyle(parent);
    if (parentStyle.position === 'static') {
      parent.style.position = 'relative';
    }

    if (this._container.parentNode !== parent) {
      parent.insertBefore(this._container, parent.firstChild);
    }

    this._isAttached = true;
    this._domElement = parent;
  }

  private updateContainerSize(canvas: HTMLCanvasElement): void {
    const rect = canvas.getBoundingClientRect();
    this._container.style.width = `${rect.width}px`;
    this._container.style.height = `${rect.height}px`;
  }

  private acquireElement(): HTMLDivElement {
    const element = this._elementPool.pop() ?? this.createClusterElement();
    element.classList.remove('fade-out', 'hovered');
    element.style.display = 'flex';
    element.style.setProperty('--cluster-fade-opacity', '1');
    this._container.appendChild(element);
    return element;
  }

  private releaseElement(element: HTMLDivElement): void {
    element.classList.add('fade-out');
    const timeoutId = setTimeout(() => {
      this._pendingReleaseTimeouts.delete(timeoutId);
      element.style.display = 'none';
      if (element.parentNode === this._container) {
        element.remove();
      }
      if (this._elementPool.length < this._maxPoolSize) {
        this._elementPool.push(element);
      }
    }, 150);
    this._pendingReleaseTimeouts.add(timeoutId);
  }

  private createClusterElement(): HTMLDivElement {
    const element = document.createElement('div');
    element.className = `${this._classPrefix}-icon`;

    const countSpan = document.createElement('span');
    countSpan.className = this._countSpanName;
    element.appendChild(countSpan);

    return element;
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
      if (!clusterData.isCluster) continue;

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
    if (distance <= this._clusterFadeStartDistance) return 1;
    if (distance >= this._clusterFadeEndDistance) return 0;
    const range = this._clusterFadeEndDistance - this._clusterFadeStartDistance;
    return 1 - (distance - this._clusterFadeStartDistance) / range;
  }

  private applyClusterElementUpdate(
    element: HTMLDivElement,
    info: ClusterScreenInfo,
    isOccluded: boolean,
    canvas: HTMLCanvasElement
  ): void {
    const { screenPos, distance, projectedSize, data } = info;
    const { width: canvasWidth, height: canvasHeight } = canvas.getBoundingClientRect();
    const offScreenMargin = projectedSize / 2;

    const fadeOpacity = isOccluded ? this.computeFadeOpacity(distance) : 1;

    if (
      fadeOpacity === 0 ||
      screenPos.z > 1 ||
      screenPos.x < -offScreenMargin ||
      screenPos.x > canvasWidth + offScreenMargin ||
      screenPos.y < -offScreenMargin ||
      screenPos.y > canvasHeight + offScreenMargin
    ) {
      element.style.display = 'none';
      return;
    }

    element.style.display = 'flex';
    element.style.setProperty('--cluster-fade-opacity', String(fadeOpacity));

    element.style.left = `${screenPos.x}px`;
    element.style.top = `${screenPos.y}px`;
    element.style.width = `${projectedSize}px`;
    element.style.height = `${projectedSize}px`;
    element.style.fontSize = `${projectedSize * 0.25}px`;
    element.style.setProperty('--size', `${projectedSize}px`);

    const countSpan = element.querySelector(`.${this._countSpanName}`);
    if (countSpan instanceof HTMLSpanElement) {
      const displayCount = data.clusterSize > 999 ? '999+' : data.clusterSize.toString();
      if (countSpan.textContent !== displayCount) {
        countSpan.textContent = displayCount;
      }
    }

    const isHovered = data.icon === this._hoveredClusterIcon;
    this.setElementHovered(element, isHovered);
  }

  private setElementHovered(element: HTMLDivElement, hovered: boolean): void {
    if (!this._enableHoverAnimations) {
      return;
    }

    if (hovered) {
      element.classList.add('hovered');
    } else {
      element.classList.remove('hovered');
    }
  }
}
