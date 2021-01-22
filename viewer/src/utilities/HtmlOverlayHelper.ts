/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { worldToViewport } from './worldToViewport';

export class HtmlOverlayHelper {
  private readonly _viewerDomElement: HTMLElement;
  private readonly _htmlOverlays: Map<HTMLElement, THREE.Vector3> = new Map();
  // Allocate variables needed for processing once to avoid allocations
  private readonly _preallocatedVariables = {
    camPos: new THREE.Vector3(),
    camNormal: new THREE.Vector3(),
    point: new THREE.Vector3(),
    nearPlane: new THREE.Plane(),
    farPlane: new THREE.Plane()
  };

  constructor(viewerDomElement: HTMLElement) {
    this._viewerDomElement = viewerDomElement;
  }

  addOverlayElement(htmlElement: HTMLElement, position3D: THREE.Vector3) {
    if (htmlElement.style.position !== 'absolute') {
      throw new Error('htmlElement style must have a position of absolute');
    }
    if (this._viewerDomElement.contains(htmlElement)) {
      throw new Error(`Element is already attached to viewer`);
    }

    this._viewerDomElement.appendChild(htmlElement);
    this._htmlOverlays.set(htmlElement, position3D);
  }

  removeOverlayElement(htmlElement: HTMLElement) {
    if (!this._viewerDomElement.contains(htmlElement) || !this._htmlOverlays.has(htmlElement)) {
      throw new Error(`Element is not attached to viewer`);
    }
    this._viewerDomElement.removeChild(htmlElement);
    this._htmlOverlays.delete(htmlElement);
  }

  updatePositions(renderer: THREE.Renderer, camera: THREE.PerspectiveCamera) {
    if (this._htmlOverlays.size === 0) {
      return;
    }

    const { camPos, camNormal, point, nearPlane, farPlane } = this._preallocatedVariables;

    // Determine near/far plane to cull based on distance. Note! We don't cull outside the "walls"
    // of the frustum to allow HTML elements that are partially outside the edges. The HTML clipping
    // will fix this anyways
    camera.getWorldPosition(camPos);
    camera.getWorldDirection(camNormal);
    point.copy(camPos).addScaledVector(camNormal, camera.near);
    nearPlane.setFromNormalAndCoplanarPoint(camNormal, point);
    point.copy(camPos).addScaledVector(camNormal, camera.far);
    farPlane.setFromNormalAndCoplanarPoint(camNormal, point);

    this._htmlOverlays.forEach((position3D, htmlElement) => {
      const insideCameraPlanes =
        nearPlane.distanceToPoint(position3D) >= 0.0 && farPlane.distanceToPoint(position3D) <= 0.0;
      if (insideCameraPlanes) {
        const canvas = renderer.domElement;
        const { x, y } = worldToViewport(canvas, camera, position3D);
        htmlElement.style.visibility = 'visible';
        htmlElement.style.top = `${y + canvas.offsetTop}px`;
        htmlElement.style.left = `${x + canvas.offsetLeft}px`;
      } else {
        // Outside frustum - hide point
        htmlElement.style.visibility = 'hidden';
      }
    });
  }
}
