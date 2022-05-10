/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import * as THREE from 'three';
import { HtmlOverlayTool } from '../HtmlOverlay/HtmlOverlayTool';
import labelCSS from './styles/Label.css';

export class MeasurementLabel {
  private readonly _htmlOverlay: HtmlOverlayTool;
  private _labelElement: HTMLDivElement;
  private static readonly stylesId = 'reveal-viewer-label';

  private static readonly classnames = {
    label: 'reveal-viewer-label'
  };

  constructor(viewer: Cognite3DViewer) {
    this._htmlOverlay = new HtmlOverlayTool(viewer);
  }

  /**
   * Load the the styles from the CSS and appends them to the label
   * @returns Return if styles already loaded
   */
  private static ensureStylesLoaded(): HTMLStyleElement {
    if (document.getElementById(MeasurementLabel.stylesId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = MeasurementLabel.stylesId;
    style.appendChild(document.createTextNode(labelCSS));
    document.head.appendChild(style);
  }

  private createLabel(label: string) {
    const element = document.createElement('div');
    element.innerText = label;
    MeasurementLabel.ensureStylesLoaded();
    element.className = MeasurementLabel.classnames.label;
    return element;
  }

  /**
   * Add a label
   * @param position Label position
   * @param label Label text
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
