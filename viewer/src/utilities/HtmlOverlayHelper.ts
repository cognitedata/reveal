/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { worldToViewport } from './worldToViewport';

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

export class HtmlOverlayHelper {
  private readonly _viewerDomElement: HTMLElement;
  private readonly _htmlOverlays: Map<HTMLElement, HtmlOverlayElement> = new Map();
  // Allocate variables needed for processing once to avoid allocations
  private readonly _preallocatedVariables = {
    camPos: new THREE.Vector3(),
    camNormal: new THREE.Vector3(),
    point: new THREE.Vector3(),
    nearPlane: new THREE.Plane(),
    farPlane: new THREE.Plane(),
    position2D: new THREE.Vector2()
  };

  constructor(viewerDomElement: HTMLElement) {
    this._viewerDomElement = viewerDomElement;
  }

  addOverlayElement(htmlElement: HTMLElement, position3D: THREE.Vector3, options: HtmlOverlayOptions = {}) {
    if (htmlElement.style.position !== 'absolute') {
      throw new Error('htmlElement style must have a position of absolute');
    }
    if (this._viewerDomElement.contains(htmlElement)) {
      throw new Error(`Element is already attached to viewer`);
    }

    this._viewerDomElement.appendChild(htmlElement);
    const element: HtmlOverlayElement = { position3D, options };
    this._htmlOverlays.set(htmlElement, element);
  }

  removeOverlayElement(htmlElement: HTMLElement) {
    if (!this._viewerDomElement.contains(htmlElement) || !this._htmlOverlays.has(htmlElement)) {
      throw new Error(`Element is not attached to viewer`);
    }
    this._viewerDomElement.removeChild(htmlElement);
    this._htmlOverlays.delete(htmlElement);
  }

  updatePositions(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    if (this._htmlOverlays.size === 0) {
      return;
    }

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
}
