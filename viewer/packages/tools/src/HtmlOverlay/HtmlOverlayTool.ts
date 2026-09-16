/*!
 * Copyright 2021 Cognite AS
 */

import type { PerspectiveCamera, WebGLRenderer } from 'three';
import { Box2, Plane, Vector2, Vector3 } from 'three';

import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { BucketGrid2D } from './BucketGrid2D';

import { MetricsLogger } from '@reveal/metrics';
import type { DisposedDelegate, SceneRenderedDelegate } from '@reveal/utilities';
import { isPointVisibleByPlanes } from '@reveal/utilities';
import { assertNever, worldToViewportCoordinates } from '@reveal/utilities';
import { debounce } from 'lodash-es';
import type { Cognite3DViewer } from '@reveal/api';
import type { DataSourceType } from '@reveal/data-providers';

/**
 * Callback that is triggered whenever the 2D position of an overlay is updated
 * in {@link HtmlOverlayTool}.
 */
export type HtmlOverlayPositionUpdatedDelegate = (
  element: HTMLElement,
  position2D: Vector2,
  position3D: Vector3,
  distanceToCamera: number,
  userData: any
) => void;

/**
 * Callback that is triggered when a set of overlays are clustered together in
 * {@link HtmlOverlayTool}.
 */
export type HtmlOverlayCreateClusterDelegate = (
  overlayElements: {
    htmlElement: HTMLElement;
    userData: any;
  }[]
) => HTMLElement;

/**
 * Options for an overlay added using {@link HtmlOverlayTool.add}.
 */
export type HtmlOverlayOptions = {
  /**
   * Callback that is triggered whenever the position of the overlay is updated. Optional.
   */
  positionUpdatedCallback?: HtmlOverlayPositionUpdatedDelegate;
  /**
   * Optional user specified data that is provided to the {@link HtmlOverlayCreateClusterDelegate} and
   * {@link HtmlOverlayPositionUpdatedDelegate}.
   */
  userData?: any;
};

/**
 * Controls how close overlay elements are clustered together.
 */
export type HtmlOverlayToolClusteringOptions = {
  /**
   * Currently only 'overlapInScreenSpace' is supported. In this mode,
   * overlays are clustered together into a single element as defined by
   * the {@link HtmlOverlayToolClusteringOptions.createClusterElementCallback} and hidden when they overlap
   * in screen space. The composite element is placed at the midpoint of
   * all clustered elements.
   *
   * Clustered elements are faded in/out using CSS styling `transition`,
   * `opacity` and `visibility`.
   */
  mode: 'overlapInScreenSpace';

  /**
   * Callback that is triggered when a set of overlays are clustered together
   * to create a "composite" element as a placeholder for the clustered elements.
   * Composite elements are cached and reused across frames, so this callback is
   * only invoked when the cluster composition changes (i.e. when the set of
   * clustered overlays differs from any previously seen cluster).
   *
   * Note: because the callback is not re-invoked while a cluster persists,
   * the produced composite element will not reflect later mutations to the
   * `userData` of any clustered overlay. Treat `userData` as immutable for
   * overlays that may be clustered, or rebuild the affected overlays
   * (remove + add) to force a fresh composite to be created.
   *
   * The composite's screen position is updated each frame by the tool, but
   * the callback itself should not depend on viewport state (camera position,
   * cluster midpoint, screen coordinates, etc.) since the returned element
   * is reused across frames as the camera moves.
   */
  createClusterElementCallback: HtmlOverlayCreateClusterDelegate;
};

/**
 * Options for the visualization of overlays
 */
export type HtmlOverlayToolOptions = {
  /**
   * Options for clustering the HTML overlays
   */
  clusteringOptions?: HtmlOverlayToolClusteringOptions;
};

type HtmlOverlayElement = {
  position3D: Vector3;
  options: HtmlOverlayOptions;

  state: {
    visible: boolean;
    position2D: Vector2;
    width: number;
    height: number;
  };
};

/**
 * Manages HTMLoverlays for {@link Cognite3DViewer}. Attaches HTML elements to a
 * 3D position and updates its position/visibility as user moves the camera. This is
 * useful to create HTML overlays to highlight information about key positions in the 3D model.
 *
 * Attached elements *must* have CSS style 'position: absolute'. It's also recommended
 * in most cases to have styles 'pointer-events: none' and 'touch-action: none' to avoid
 * interfering with 3D navigation. Consider also applying 'transform: translate(-50%, -50%)'
 * to anchor the center of the element rather than the top-left corner. In some cases the
 * `zIndex`-attribute is necessary for the element to appear on top of the viewer.
 *
 * @example
 * ```js
 * const el = document.createElement('div');
 * el.style.position = 'absolute'; // Required!
 * // Anchor to center of element
 * el.style.transform = 'translate(-50%, -50%)';
 * // Avoid being target for events
 * el.style.pointerEvents = 'none;
 * el.style.touchAction = 'none';
 * // Render in front of other elements
 * el.style.zIndex = 10;
 *
 * el.style.color = 'red';
 * el.innerHtml = '<h1>Overlay</h1>';
 *
 * const overlayTool = new HtmlOverlayTool(viewer);
 * overlayTool.add(el, new Vector3(10, 10, 10));
 * // ...
 * overlayTool.remove(el);
 * // or, to remove all attached elements
 * overlayTool.clear();
 *
 * // detach the tool from the viewer
 * overlayTool.dispose();
 * ```
 */
export class HtmlOverlayTool extends Cognite3DViewerToolBase {
  private readonly _viewer: Cognite3DViewer<DataSourceType>;
  private readonly _options: HtmlOverlayToolOptions;
  private readonly _htmlOverlays: Map<HTMLElement, HtmlOverlayElement> = new Map();
  private readonly _compositeOverlays: HTMLElement[] = [];
  private _visible: boolean;
  private readonly TIMER_ADVANCE_MS = 50;

  // Stable identity for overlay elements — used to build cluster cache keys
  private readonly _elementIds = new WeakMap<HTMLElement, number>();
  private _nextElementId = 0;

  // Cluster cache: reuse composite DOM elements when cluster composition hasn't changed
  private readonly _clusterCache = new Map<string, HTMLElement>();
  private readonly _aliveClusterKeys = new Set<string>();

  private readonly _onSceneRenderedHandler: SceneRenderedDelegate;
  private readonly _onViewerDisposedHandler: DisposedDelegate;
  // Allocate variables needed for processing once to avoid allocations
  private readonly _preallocatedVariables = {
    camPos: new Vector3(),
    camNormal: new Vector3(),
    point: new Vector3(),
    nearPlane: new Plane(),
    farPlane: new Plane(),
    position2D: new Vector2()
  };

  private readonly scheduleUpdate: () => void;

  private get viewerDomElement(): HTMLElement {
    return this._viewer.domElement;
  }

  private get viewerCamera(): PerspectiveCamera {
    return this._viewer.cameraManager.getCamera();
  }

  private get viewerCanvas(): HTMLCanvasElement {
    return this._viewer.canvas;
  }

  constructor(viewer: Cognite3DViewer<DataSourceType>, options?: HtmlOverlayToolOptions) {
    super();

    this._onSceneRenderedHandler = this.onSceneRendered.bind(this);
    this._onViewerDisposedHandler = this.onViewerDisposed.bind(this);
    this._options = options ?? {};
    this._viewer = viewer;
    this._viewer.on('sceneRendered', this._onSceneRenderedHandler);
    this._viewer.on('disposed', this._onViewerDisposedHandler);

    this.scheduleUpdate = debounce(() => this.forceUpdate(), 20);

    this._visible = true;

    MetricsLogger.trackCreateTool('HtmlOverlayTool');
  }

  /**
   * Returns all added HTML elements along with their 3D positions.
   */
  get elements(): { element: HTMLElement; position3D: Vector3 }[] {
    return Array.from(this._htmlOverlays.entries()).map(([element, info]) => {
      return { element, position3D: info.position3D };
    });
  }

  /**
   * Removes all elements and detaches from the viewer.
   * @override
   */
  dispose(): void {
    this._viewer.off('sceneRendered', this._onSceneRenderedHandler);
    this._viewer.off('disposed', this._onViewerDisposedHandler);
    this.clear();
    super.dispose();
  }

  /**
   * Registers a HTML overlay that will be updated on rendering.
   *
   * @param htmlElement
   * @param position3D
   * @param options
   */
  add(htmlElement: HTMLElement, position3D: Vector3, options: HtmlOverlayOptions = {}): void {
    this.ensureNotDisposed();

    if (this.viewerDomElement.contains(htmlElement)) {
      throw new Error(`Element is already attached to viewer`);
    }

    htmlElement.style.visibility = 'hidden';

    this.viewerDomElement.appendChild(htmlElement);
    setTimeout(() => {
      if (htmlElement.style.position !== 'absolute') {
        this.viewerDomElement.removeChild(htmlElement);
        throw new Error(`htmlElement style must have a position of absolute. but was '${htmlElement.style.position}'`);
      }

      const element: HtmlOverlayElement = {
        position3D,
        options,
        state: {
          position2D: new Vector2(),
          width: -1,
          height: -1,
          visible: true
        }
      };
      this._htmlOverlays.set(htmlElement, element);
      this._elementIds.set(htmlElement, this._nextElementId++);

      this.scheduleUpdate();
    }, this.TIMER_ADVANCE_MS);
  }

  /**
   * Removes a overlay and removes it from the DOM.
   * @param htmlElement
   */
  remove(htmlElement: HTMLElement): void {
    this.ensureNotDisposed();
    if (!this.viewerDomElement.contains(htmlElement) || !this._htmlOverlays.has(htmlElement)) {
      throw new Error(`Element is not attached to viewer`);
    }
    this.viewerDomElement.removeChild(htmlElement);
    this._htmlOverlays.delete(htmlElement);
    this.invalidateClustersForElement(htmlElement);
  }

  /**
   * Removes all attached HTML overlay elements.
   */
  clear(): void {
    this.ensureNotDisposed();
    this._htmlOverlays.forEach((_, htmlElement) => {
      this.viewerDomElement.removeChild(htmlElement);
    });
    this._htmlOverlays.clear();
    this._clusterCache.forEach(compositeElement => {
      compositeElement.parentNode?.removeChild(compositeElement);
    });
    this._clusterCache.clear();
    this._aliveClusterKeys.clear();
    this._compositeOverlays.splice(0);
    this.forceUpdate();
  }

  /**
   * Hide/unhide all HTML overlay elements.
   * @param enable
   */
  visible(enable: boolean): void {
    const visible = enable === true ? 'visible' : 'hidden';
    this._visible = enable;

    this._htmlOverlays.forEach((_element, htmlElement) => {
      htmlElement.style.visibility = visible;
    });

    this._compositeOverlays.forEach(element => {
      element.style.visibility = visible;
    });
    //update the elements when visibilty is back to show overlay.
    this.forceUpdate();
  }

  /**
   * Updates positions of all overlays. This is automatically managed and there
   * shouldn't be any reason to trigger this unless the attached elements are
   * modified externally.
   *
   * Calling this function often might cause degraded performance.
   * @param customCamera Optional camera to be used in place of viewerCamera when calculating positions
   */
  forceUpdate(customCamera?: PerspectiveCamera): void {
    // Do not update elements if overlay visibility is set to hidden/false.
    if (!this._visible) {
      return;
    }
    this.ensureNotDisposed();
    this.cleanupClusterElements();
    this.updateNewElementSizes();

    const camera = customCamera ?? this.viewerCamera;
    const canvas = this._viewer.canvas;
    const { camPos, camNormal, point, nearPlane, farPlane, position2D } = this._preallocatedVariables;

    // Determine near/far plane to cull based on distance. Note! We don't cull outside the "walls"
    // of the frustum to allow HTML elements that are partially outside the edges. The HTML clipping
    // will fix this anyways
    camera.getWorldPosition(camPos);
    camera.getWorldDirection(camNormal);
    point.copy(camPos).addScaledVector(camNormal, camera.near);
    nearPlane.setFromNormalAndCoplanarPoint(camNormal, point);
    point.copy(camPos).addScaledVector(camNormal, camera.far);
    farPlane.setFromNormalAndCoplanarPoint(camNormal, point);

    this._htmlOverlays.forEach((element, htmlElement) => {
      const {
        position3D,
        options: { positionUpdatedCallback, userData },
        state
      } = element;

      const insideCameraPlanes =
        nearPlane.distanceToPoint(position3D) >= 0.0 && farPlane.distanceToPoint(position3D) <= 0.0;
      const insideClippingPlanes = isPointVisibleByPlanes(this._viewer.getGlobalClippingPlanes(), position3D);
      const { x, y } = worldToViewportCoordinates(canvas, camera, position3D);

      if (insideCameraPlanes && insideClippingPlanes) {
        state.position2D.set(x, y);
        state.visible = true;
      } else {
        // Outside frustum - hide point
        state.visible = false;
      }

      if (positionUpdatedCallback) {
        position2D.set(x, y);
        const distanceToCamera = camPos.distanceTo(position3D);
        positionUpdatedCallback(htmlElement, position2D, position3D, distanceToCamera, userData);
      }
    });
    this.clusterElements();
    this.commitDOMChanges();
  }

  /**
   * Update size of new elements. This is only done once as this causes
   * layout to be invalidated which is an expensive operation.
   */
  private updateNewElementSizes() {
    this._htmlOverlays.forEach((element, htmlElement) => {
      if (element.state.width === -1) {
        const clientRect = htmlElement.getBoundingClientRect();
        element.state.width = clientRect.width;
        element.state.height = clientRect.height;
      }
    });
  }

  private commitDOMChanges() {
    const canvas = this.viewerCanvas;
    // Compute once as updating styles below will cause (unnecessary)
    // recomputation which slows down the process
    const offsetLeft = canvas.offsetLeft;
    const offsetTop = canvas.offsetTop;

    this._htmlOverlays.forEach((element, htmlElement) => {
      const { state } = element;
      htmlElement.style.left = `${state.position2D.x + offsetLeft}px`;
      htmlElement.style.top = `${state.position2D.y + offsetTop}px`;

      if (state.visible && htmlElement.style.visibility !== 'visible') {
        fadeIn(htmlElement);
      } else if (!state.visible && htmlElement.style.visibility !== 'hidden') {
        fadeOut(htmlElement);
      }
    });

    this.removeStaleClusters();
    this._compositeOverlays.forEach(htmlElement => {
      if (!htmlElement.parentNode) {
        this.viewerDomElement.appendChild(htmlElement);
      }
    });
  }

  private clusterElements() {
    const options = this._options.clusteringOptions;
    if (options === undefined) {
      return;
    }

    switch (options.mode) {
      case 'overlapInScreenSpace':
        this.clusterByOverlapInScreenSpace(options.createClusterElementCallback);
        break;

      default:
        assertNever(options.mode, `Unsupported clustering mode: '${options.mode}`);
    }
  }

  private cleanupClusterElements(): void {
    // Mark all cached clusters as stale. Clustering will mark alive ones.
    this._aliveClusterKeys.clear();
  }

  /**
   * Invalidate any cached cluster composites that referenced the given overlay
   * element. Used when an overlay is removed so its cluster composite is
   * detached from the DOM immediately rather than lingering until the next
   * frame's stale-cluster sweep.
   */
  private invalidateClustersForElement(htmlElement: HTMLElement): void {
    const removedId = this._elementIds.get(htmlElement);
    if (removedId === undefined) {
      return;
    }
    for (const [key, compositeElement] of this._clusterCache.entries()) {
      if (!clusterKeyContainsId(key, removedId)) {
        continue;
      }
      compositeElement.parentNode?.removeChild(compositeElement);
      this._clusterCache.delete(key);
      this._aliveClusterKeys.delete(key);
      // An overlay can belong to at most one cluster per frame (the grid
      // removes elements once clustered) and stale clusters are swept each
      // frame, so the cache contains at most one match.
      break;
    }
  }

  /**
   * Remove cluster cache entries that were not reused during the current frame
   * and detach their composite elements from the DOM.
   */
  private removeStaleClusters(): void {
    for (const [key, compositeElement] of this._clusterCache.entries()) {
      if (!this._aliveClusterKeys.has(key)) {
        if (compositeElement.parentNode) {
          compositeElement.parentNode.removeChild(compositeElement);
        }
        this._clusterCache.delete(key);
      }
    }
    // Rebuild _compositeOverlays from only the alive entries
    this._compositeOverlays.splice(0);
    for (const key of this._aliveClusterKeys) {
      const el = this._clusterCache.get(key);
      if (el) {
        this._compositeOverlays.push(el);
      }
    }
  }

  private clusterByOverlapInScreenSpace(createClusterElementCallback: HtmlOverlayCreateClusterDelegate) {
    type Element = HtmlOverlayElement & { htmlElement: HTMLElement };

    const canvas = this.viewerCanvas;
    const canvasBounds = domRectToBox2(canvas.getBoundingClientRect());
    const canvasSize = canvasBounds.getSize(new Vector2());
    canvasBounds.set(new Vector2(0, 0), canvasSize);
    // Compute once as updating styles below will cause (unnecessary)
    // recomputation which slows down the process

    const grid = new BucketGrid2D<Element>(canvasBounds, [10, 10]);
    for (const [htmlElement, element] of this._htmlOverlays.entries()) {
      const { state } = element;
      const elementBounds = createElementBounds(element);
      if (!state.visible || !elementBounds.intersectsBox(canvasBounds) || htmlElement.hidden) {
        continue;
      }
      grid.insert(elementBounds, { htmlElement, ...element });
    }

    const elementBounds = new Box2();
    const clusterMidpoint = new Vector2();
    for (const element of this._htmlOverlays.values()) {
      const { state } = element;
      createElementBounds(element, elementBounds);
      if (!state.visible || !elementBounds.intersectsBox(canvasBounds)) {
        continue;
      }

      const cluster = Array.from(grid.removeOverlappingElements(elementBounds));
      if (cluster.length > 1) {
        const midpoint = cluster
          .reduce((position, element) => position.add(element.state.position2D), clusterMidpoint.set(0, 0))
          .divideScalar(cluster.length);

        const clusterKey = this.createClusterKey(cluster);

        let compositeElement = this._clusterCache.get(clusterKey);
        if (!compositeElement) {
          // Composition changed — create a new composite element
          compositeElement = createClusterElementCallback(
            cluster.map(element => ({ htmlElement: element.htmlElement, userData: element.options.userData }))
          );
          this._clusterCache.set(clusterKey, compositeElement);
        }

        // Hide all elements in cluster
        cluster.forEach(element => (element.state.visible = false));
        // Update position (may have shifted) and mark as alive
        this._aliveClusterKeys.add(clusterKey);
        this.addComposite(compositeElement, midpoint);
      }
    }
  }

  private createClusterKey(cluster: { htmlElement: HTMLElement }[]): string {
    return cluster
      .map(el => {
        let id = this._elementIds.get(el.htmlElement);
        if (id === undefined) {
          // Overlay reached clustering before add()'s deferred ID
          // assignment ran (or via a path that bypassed it). Assign
          // lazily so a stable key can still be produced.
          id = this._nextElementId++;
          this._elementIds.set(el.htmlElement, id);
        }
        return id;
      })
      .sort((a, b) => a - b)
      .join(',');
  }

  private addComposite(htmlElement: HTMLElement, position: Vector2) {
    const canvas = this.viewerCanvas;
    htmlElement.style.visibility = 'visible';
    htmlElement.style.left = `${position.x + canvas.offsetLeft}px`;
    htmlElement.style.top = `${position.y + canvas.offsetTop}px`;
  }

  private onSceneRendered(event: {
    frameNumber: number;
    renderTime: number;
    renderer: WebGLRenderer;
    camera: PerspectiveCamera;
  }): void {
    this.forceUpdate(event.camera);
  }

  private onViewerDisposed(): void {
    this.dispose();
  }
}

/**
 * Hides an element and applies a CSS transition.
 */
function fadeOut(htmlElement: HTMLElement) {
  // https://stackoverflow.com/a/4861306
  htmlElement.style.visibility = 'hidden';
  htmlElement.style.opacity = '0';
  htmlElement.style.transition = 'visibility 0s 0.2s, opacity 0.2s linear';
}

/**
 * Shows an element and applies a CSS transition.
 */
function fadeIn(htmlElement: HTMLElement) {
  // https://stackoverflow.com/a/4861306
  htmlElement.style.visibility = 'visible';
  htmlElement.style.opacity = '1';
  htmlElement.style.transition = 'opacity 0.2s linear';
}

function domRectToBox2(rect: DOMRect, out?: Box2): Box2 {
  out = out ?? new Box2();
  out.min.set(rect.left, rect.top);
  out.max.set(rect.right, rect.bottom);
  return out;
}

function clusterKeyContainsId(key: string, id: number): boolean {
  return key.split(',').includes(`${id}`);
}

function createElementBounds(element: HtmlOverlayElement, out?: Box2) {
  const { state } = element;
  out = out ?? new Box2();
  out.min.set(state.position2D.x, state.position2D.y);
  out.max.set(state.position2D.x + state.width, state.position2D.y + state.height);
  return out;
}
