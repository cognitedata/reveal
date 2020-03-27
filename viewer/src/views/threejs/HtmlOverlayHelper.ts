/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { worldToViewport } from './worldToViewport';

export class HtmlOverlayHelper {
  private readonly htmlOverlays: Map<HTMLElement, THREE.Vector3> = new Map();

  addOverlayElement(htmlElement: HTMLElement, position3D: THREE.Vector3) {
    this.htmlOverlays.set(htmlElement, position3D);
  }

  removeOverlayElement(htmlElement: HTMLElement) {
    this.htmlOverlays.delete(htmlElement);
  }

  updatePositions(renderer: THREE.Renderer, camera: THREE.PerspectiveCamera) {
    this.htmlOverlays.forEach((position3D, htmlElement) => {
      const canvas = renderer.domElement;
      const { x, y } = worldToViewport(canvas, camera, position3D);
      htmlElement.style.top = `${y + canvas.offsetTop}px`;
      htmlElement.style.left = `${x + canvas.offsetLeft}px`;
    });
  }
}
