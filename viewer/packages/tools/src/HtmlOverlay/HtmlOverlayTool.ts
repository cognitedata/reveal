/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { BucketGrid2D } from './BucketGrid2D';

import { trackCreateTool } from '@reveal/metrics';
import { assertNever, worldToViewportCoordinates } from '@reveal/core/utilities';
import { Cognite3DViewer, DisposedDelegate, SceneRenderedDelegate } from '@reveal/core';

export type HtmlOverlayPositionUpdatedDelegate = (
  element: HTMLElement,
  position2D: THREE.Vector2,
  position3D: THREE.Vector3,
  distanceToCamera: number,
  userData: any
) => void;

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

export type HtmlOverlayToolClusteringOptions = {
  mode: 'overlapInScreenspace';
  createClusterElementCallback: HtmlOverlayCreateClusterDelegate;
};

export type HtmlOverlayToolOptions = {
  clusteringOptions?: HtmlOverlayToolClusteringOptions;
};

type HtmlOverlayElement = {
  position3D: THREE.Vector3;
  options: HtmlOverlayOptions;

  state: {
    visible: boolean;
    position2D: THREE.Vector2;
    width: number;
    height: number;
  };
};

const hiddenPosition = new THREE.Vector2();

/**
 * Manages HTMLoverlays for {@see Cognite3DViewer}. Attaches HTML elements to a 
 * 3D position and updates it's position/visibility as user moves the camera. This is 
 * useful to create HTML overlays to highlight information about key positions in the 3D model.
 *
 * Attached elements *must* have CSS style 'position: absolute'. It's also recommended
 * in most cases to have styles 'pointerEvents: none' and 'touchAction: none' to avoid
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
 * overlayTool.add(el, new THREE.Vector3(10, 10, 10));
 * // ...
 * overlayTool.remove(el);
 * // or, to remove all attached elements
 * overlayTool.clear();
 
 * // detach the tool from the viewer
 * overlayTool.dispose();
 * ```
 */
export class HtmlOverlayTool extends Cognite3DViewerToolBase {
  private readonly _viewer: Cognite3DViewer;
  private readonly _options: HtmlOverlayToolOptions;
  private readonly _htmlOverlays: Map<HTMLElement, HtmlOverlayElement> = new Map();
  private readonly _compositeOverlays: HTMLElement[] = [];

  private readonly _onSceneRenderedHandler: SceneRenderedDelegate;
  private readonly _onViewerDisposedHandler: DisposedDelegate;
  // Allocate variables needed for processing once to avoid allocations
  private readonly _preallocatedVariables = {
    camPos: new THREE.Vector3(),
    camNormal: new THREE.Vector3(),
    point: new THREE.Vector3(),
    nearPlane: new THREE.Plane(),
    farPlane: new THREE.Plane(),
    position2D: new THREE.Vector2()
  };

  private get viewerDomElement(): HTMLElement {
    return this._viewer.domElement;
  }

  private get viewerCamera(): THREE.PerspectiveCamera {
    return this._viewer.getCamera();
  }

  private get viewerRenderer(): THREE.WebGLRenderer {
    return this._viewer.renderer;
  }

  constructor(viewer: Cognite3DViewer, options?: HtmlOverlayToolOptions) {
    super();

    this._onSceneRenderedHandler = this.onSceneRendered.bind(this);
    this._onViewerDisposedHandler = this.onViewerDisposed.bind(this);
    this._options = options ?? {};
    this._viewer = viewer;
    this._viewer.on('sceneRendered', this._onSceneRenderedHandler);
    this._viewer.on('disposed', this._onViewerDisposedHandler);

    trackCreateTool('HtmlOverlayTool');
  }

  /**
   * Returns all added HTML elements along with their 3D positions.
   */
  get elements(): { element: HTMLElement; position3D: THREE.Vector3 }[] {
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
  add(htmlElement: HTMLElement, position3D: THREE.Vector3, options: HtmlOverlayOptions = {}) {
    this.ensureNotDisposed();

    if (this.viewerDomElement.contains(htmlElement)) {
      throw new Error(`Element is already attached to viewer`);
    }

    // Note! Must be part of DOM tree before we do getComputedStyle(), so add before check
    this.viewerDomElement.appendChild(htmlElement);
    const style = getComputedStyle(htmlElement);
    if (style.position !== 'absolute') {
      this.viewerDomElement.removeChild(htmlElement);
      throw new Error(`htmlElement style must have a position of absolute. but was '${style.position}'`);
    }

    const element: HtmlOverlayElement = {
      position3D,
      options,
      state: {
        position2D: hiddenPosition.clone(),
        width: 0,
        height: 0,
        visible: true
      }
    };
    this._htmlOverlays.set(htmlElement, element);

    this.forceUpdate();
  }

  /**
   * Removes a overlay and removes it from the DOM.
   * @param htmlElement
   */
  remove(htmlElement: HTMLElement) {
    this.ensureNotDisposed();
    if (!this.viewerDomElement.contains(htmlElement) || !this._htmlOverlays.has(htmlElement)) {
      throw new Error(`Element is not attached to viewer`);
    }
    this.viewerDomElement.removeChild(htmlElement);
    this._htmlOverlays.delete(htmlElement);
  }

  /**
   * Removes all attached HTML overlay elements.
   */
  clear() {
    const overlays = Array.from(this._htmlOverlays.keys());
    for (const element of overlays) {
      this.remove(element);
    }
  }

  /**
   * Updates positions of all overlays. This is automatically managed and there
   * shouldn't be any reason to trigger this unless the attached elements are
   * modified externally.
   */
  forceUpdate(): void {
    this.ensureNotDisposed();
    this.cleanupClusterElements();
    if (this._htmlOverlays.size === 0) {
      return;
    }

    const camera = this.viewerCamera;
    const renderer = this.viewerRenderer;
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

    // Determine bounds up front to avoid dealing with recomputed styles
    this._htmlOverlays.forEach((_, htmlElement) => {
      htmlElement.style.visibility = 'initial';
    });
    this._htmlOverlays.forEach((element, htmlElement) => {
      const clientRect = htmlElement.getBoundingClientRect();
      element.state.width = clientRect.width;
      element.state.height = clientRect.height;
    });

    this._htmlOverlays.forEach((element, htmlElement) => {
      const {
        position3D,
        options: { positionUpdatedCallback, userData },
        state
      } = element;

      const insideCameraPlanes =
        nearPlane.distanceToPoint(position3D) >= 0.0 && farPlane.distanceToPoint(position3D) <= 0.0;
      const { x, y } = worldToViewportCoordinates(renderer, camera, position3D);

      if (insideCameraPlanes) {
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

  private commitDOMChanges() {
    const canvas = this.viewerRenderer.domElement;
    // Compute once as updating styles below will cause (unnecessary)
    // recomputation which slows down the process
    const offsetLeft = canvas.offsetLeft;
    const offsetTop = canvas.offsetTop;

    this._htmlOverlays.forEach((element, htmlElement) => {
      const { state } = element;
      if (state.visible) {
        htmlElement.style.visibility = 'visible';
        htmlElement.style.left = `${state.position2D.x + offsetLeft}px`;
        htmlElement.style.top = `${state.position2D.y + offsetTop}px`;
      } else {
        htmlElement.style.visibility = 'hidden';
      }
    });

    this._compositeOverlays.forEach(htmlElement => {
      this.viewerDomElement.appendChild(htmlElement);
    });
  }

  private clusterElements() {
    const options = this._options.clusteringOptions;
    if (options === undefined) {
      return;
    }

    switch (options.mode) {
      case 'overlapInScreenspace':
        this.clusterByOverlapInScreenSpace(options.createClusterElementCallback);
        break;

      default:
        assertNever(options.mode, `Unsupported clustering mode: '${options.mode}`);
    }
  }

  private cleanupClusterElements(): void {
    this._compositeOverlays.forEach(element => {
      this.viewerDomElement.removeChild(element);
    });
    this._compositeOverlays.splice(0);
  }

  private clusterByOverlapInScreenSpace(createClusterElementCallback: HtmlOverlayCreateClusterDelegate) {
    type Element = HtmlOverlayElement & { htmlElement: HTMLElement };

    const canvas = this.viewerRenderer.domElement;
    const canvasBounds = domRectToBox2(canvas.getBoundingClientRect());
    const canvasSize = canvasBounds.getSize(new THREE.Vector2());
    canvasBounds.set(new THREE.Vector2(0, 0), canvasSize);
    // Compute once as updating styles below will cause (unnecessary)
    // recomputation which slows down the process
    const elementBounds = new THREE.Box2();

    const grid = new BucketGrid2D<Element>(new THREE.Vector2(10, 10), canvasBounds);
    for (const [htmlElement, element] of this._htmlOverlays.entries()) {
      const { state } = element;
      elementBounds.min.set(state.position2D.x, state.position2D.y);
      elementBounds.max.set(state.position2D.x + state.width, state.position2D.y + state.height);
      if (!state.visible || !elementBounds.intersectsBox(canvasBounds)) {
        continue;
      }
      grid.insert(elementBounds, { htmlElement, ...element });
    }

    for (const element of this._htmlOverlays.values()) {
      const { state } = element;
      elementBounds.min.set(state.position2D.x, state.position2D.y);
      elementBounds.max.set(state.position2D.x + state.width, state.position2D.y + state.height);
      if (!state.visible || !elementBounds.intersectsBox(canvasBounds)) {
        continue;
      }

      const cluster = Array.from(grid.overlappingElements(elementBounds))
        // Remove elements now marked as hidden
        .filter(overlappingElement => overlappingElement.state.visible)
        .map(overlappingElement => ({
          htmlElement: overlappingElement.htmlElement,
          userData: overlappingElement.options.userData,
          position: elementBounds.min.clone(),
          state: overlappingElement.state
        }));

      if (cluster.length > 1) {
        const midpoint = cluster.reduce((position, element) => {
          return position.addScaledVector(element.position, 1.0 / cluster.length);
        }, new THREE.Vector2(0, 0));
        const compositeElement = createClusterElementCallback(cluster);
        // Hide all elements in cluster
        cluster.forEach(element => (element.state.visible = false));

        this.addComposite(compositeElement, midpoint);
      }
    }
  }

  private addComposite(htmlElement: HTMLElement, position: THREE.Vector2) {
    const canvas = this.viewerRenderer.domElement;
    htmlElement.style.visibility = 'visible';
    htmlElement.style.left = `${position.x + canvas.offsetLeft}px`;
    htmlElement.style.top = `${position.y + canvas.offsetTop}px`;
    this._compositeOverlays.push(htmlElement);
  }

  private onSceneRendered(): void {
    this.forceUpdate();
  }

  private onViewerDisposed(): void {
    this.dispose();
  }
}

function domRectToBox2(rect: DOMRect, out?: THREE.Box2): THREE.Box2 {
  out = out ?? new THREE.Box2();
  out.min.set(rect.left, rect.top);
  out.max.set(rect.right, rect.bottom);
  return out;
}
