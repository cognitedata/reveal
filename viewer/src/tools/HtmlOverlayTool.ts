/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { Cognite3DViewer } from '../public/migration/Cognite3DViewer';
import { DisposedDelegate, SceneRenderedDelegate } from '../public/types';

import { worldToViewport } from '../utilities/worldToViewport';
import { Cognite3DViewerToolBase } from './Cognite3DViewerToolBase';

export type HtmlOverlayPositionUpdatedDelegate = (
  element: HTMLElement,
  position2D: THREE.Vector2,
  position3D: THREE.Vector3,
  distanceToCamera: number
) => void;

export type HtmlOverlayOptions = {
  positionUpdatedCallback?: HtmlOverlayPositionUpdatedDelegate;
};

type HtmlOverlayElement = {
  position3D: THREE.Vector3;
  options: HtmlOverlayOptions;
};

/**
 *
 */
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
  private readonly _htmlOverlays: Map<HTMLElement, HtmlOverlayElement> = new Map();

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

  constructor(viewer: Cognite3DViewer) {
    super();

    this._onSceneRenderedHandler = this.onSceneRendered.bind(this);
    this._onViewerDisposedHandler = this.onViewerDisposed.bind(this);
    this._viewer = viewer;
    this._viewer.on('sceneRendered', this._onSceneRenderedHandler);
    this._viewer.on('disposed', this._onViewerDisposedHandler);
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

    const element: HtmlOverlayElement = { position3D, options };
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

    this._htmlOverlays.forEach((element, htmlElement) => {
      const {
        position3D,
        options: { positionUpdatedCallback }
      } = element;
      const canvas = renderer.domElement;

      const insideCameraPlanes =
        nearPlane.distanceToPoint(position3D) >= 0.0 && farPlane.distanceToPoint(position3D) <= 0.0;
      const { x, y } = worldToViewport(renderer, camera, position3D);

      if (insideCameraPlanes) {
        htmlElement.style.visibility = 'visible';
        htmlElement.style.top = `${y + canvas.offsetTop}px`;
        htmlElement.style.left = `${x + canvas.offsetLeft}px`;
      } else {
        // Outside frustum - hide point
        htmlElement.style.visibility = 'hidden';
      }

      if (positionUpdatedCallback) {
        position2D.set(x, y);
        const distanceToCamera = camPos.distanceTo(position3D);
        positionUpdatedCallback(htmlElement, position2D, position3D, distanceToCamera);
      }
    });
  }

  private onSceneRendered(): void {
    this.forceUpdate();
  }

  private onViewerDisposed(): void {
    this.dispose();
  }
}
