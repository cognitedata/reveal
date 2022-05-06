/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import * as THREE from 'three';
import { HtmlOverlayTool } from '../HtmlOverlay/HtmlOverlayTool';

export class MeasurementLabel {
  private readonly _htmlOverlay: HtmlOverlayTool;
  private _labelElement: HTMLDivElement;

  constructor(viewer: Cognite3DViewer) {
    this._htmlOverlay = new HtmlOverlayTool(viewer);
  }

  private createLabel(label: string) {
    const element = document.createElement('div');
    element.innerText = label;
    element.style.cssText = `
      position: absolute;

      /* Anchor to the center of the element and ignore events */
      transform: translate(-50%, -50%);
      pointer-events: none;
      touch-action: none;
      user-select: none;
      font-family: inherit;
      borderRadius: 6px;
      -webkit-border-radius: 6px;
      -moz-border-radius: 6px;

      /* Make it look nice */
      padding: 10px;
      minHeight: 50px;
      color: #fff;
      background: #232323da;
      border: '#ffffff22 solid 2px;
      overflow: hidden;
    `;
    return element;
  }

  /**
   * Add a label
   * @param position Label position
   */
  add(position: THREE.Vector3, label: string): void {
    this._labelElement = this.createLabel(label);
    this._htmlOverlay.add(this._labelElement, position);
  }

  /**
   * Remove the label
   */
  removeLabel(): void {
    if (this._labelElement) {
      this._htmlOverlay.remove(this._labelElement);
    }
  }

  /**
   * Update the label position & text
   * @param label Text to update in the element
   * @param startPoint start point
   * @param endPoint end point
   */
  update(label: string, startPoint: THREE.Vector3, endPoint: THREE.Vector3): void {
    //Return if the endPoint is not available from the Point Cloud
    if (endPoint.equals(new THREE.Vector3(0))) {
      return;
    }
    let direction = endPoint.clone().sub(startPoint);
    const length = direction.length();
    direction = direction.normalize().multiplyScalar(length * 0.5);
    const midPoint = startPoint.clone().add(direction);

    this._htmlOverlay.elements.forEach(htmlElement => {
      if (htmlElement.element === this._labelElement) {
        htmlElement.position3D.set(midPoint.x, midPoint.y, midPoint.z);
        htmlElement.element.innerText = label;
      }
    });
  }
}
