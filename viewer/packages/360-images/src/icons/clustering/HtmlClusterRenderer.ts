/*!
 * Copyright 2026 Cognite AS
 */

import { Matrix4, PerspectiveCamera, Vector3 } from 'three';
import { Overlay3DIcon } from '@reveal/3d-overlays';
import { ClusteredIconData, ClusterRenderParams } from './ClusterRenderingStrategy';
import { worldToViewportCoordinates } from '@reveal/utilities';
import { generateClusterStyles } from './htmlClusterStyles';

export type HtmlClusterRendererOptions = {
  maxPoolSize?: number;
  classPrefix?: string;
  enableHoverAnimations?: boolean;
  zIndex?: number;
};

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

  private readonly _pendingReleaseTimeouts = new Set<ReturnType<typeof setTimeout>>();

  private _hoveredClusterIcon: Overlay3DIcon | undefined = undefined;
  private _isVisible: boolean = true;
  private _isAttached: boolean = false;
  private _domElement: HTMLElement | undefined = undefined;

  private readonly _tempPosition = new Vector3();
  private readonly _tempProjectedPosition = new Vector3();

  constructor(options: HtmlClusterRendererOptions = {}) {
    this._maxPoolSize = options.maxPoolSize ?? 100;
    this._classPrefix = options.classPrefix ?? 'reveal-cluster';
    this._countSpanName = `${this._classPrefix}-count`;
    this._enableHoverAnimations = options.enableHoverAnimations ?? true;
    this._zIndex = options.zIndex;
    this._container = this.createContainer();
    this.injectStyles();
  }

  public updateClusters(visibleClusters: ClusteredIconData[], params: ClusterRenderParams): void {
    const { renderer, camera, modelTransform } = params;

    if (!this._isVisible) {
      return;
    }

    this.ensureAttached(renderer.domElement);
    const visibleIcons = new Set<Overlay3DIcon>();
    this.updateContainerSize(renderer.domElement);

    for (const clusterData of visibleClusters) {
      if (!clusterData.isCluster) {
        continue;
      }

      visibleIcons.add(clusterData.icon);

      let element = this._activeElements.get(clusterData.icon);
      if (!element) {
        element = this.acquireElement();
        this._activeElements.set(clusterData.icon, element);
      }

      this.updateClusterElement(element, clusterData, camera, modelTransform, renderer.domElement);
    }

    for (const [icon, element] of this._activeElements.entries()) {
      if (!visibleIcons.has(icon)) {
        this.releaseElement(element);
        this._activeElements.delete(icon);
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
    this._container.style.display = visible ? 'block' : 'none';
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
    // Only set z-index if explicitly specified (undefined = natural DOM stacking)
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
      // Insert as first child, then the natural stacking with z-index: 0 will place it behind
      // canvas content but the absolute positioning keeps it visible
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

  private updateClusterElement(
    element: HTMLDivElement,
    clusterData: ClusteredIconData,
    camera: PerspectiveCamera,
    modelTransform: Matrix4,
    canvas: HTMLCanvasElement
  ): void {
    this._tempPosition.copy(clusterData.clusterPosition);
    this._tempPosition.applyMatrix4(modelTransform);

    const screenPos = worldToViewportCoordinates(canvas, camera, this._tempPosition, this._tempProjectedPosition);

    const distance = camera.position.distanceTo(this._tempPosition);
    const projectedSize = Math.max(this._minSize, Math.min(this._maxSize, this._baseSize / Math.max(distance, 1)));

    const { width: canvasWidth, height: canvasHeight } = canvas.getBoundingClientRect();
    // Use half the projected size as margin so the icon is fully off-screen before being hidden
    const offScreenMargin = projectedSize / 2;

    if (
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

    element.style.left = `${screenPos.x}px`;
    element.style.top = `${screenPos.y}px`;
    element.style.width = `${projectedSize}px`;
    element.style.height = `${projectedSize}px`;
    element.style.fontSize = `${projectedSize * 0.25}px`;
    // Set --size CSS variable for proportional border scaling
    element.style.setProperty('--size', `${projectedSize}px`);

    const countSpan = element.querySelector(`.${this._countSpanName}`) as HTMLSpanElement;
    if (countSpan) {
      const displayCount = clusterData.clusterSize > 999 ? '999+' : clusterData.clusterSize.toString();
      if (countSpan.textContent !== displayCount) {
        countSpan.textContent = displayCount;
      }
    }

    const isHovered = clusterData.icon === this._hoveredClusterIcon;
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
