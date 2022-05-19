/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import * as THREE from 'three';
import { HtmlOverlayTool, HtmlOverlayToolOptions } from '../HtmlOverlay/HtmlOverlayTool';
import labelCSS from './styles/Label.css';

export class MeasurementLabel {
  private readonly _htmlOverlay: HtmlOverlayTool;
  private _labelElement: HTMLDivElement;
  private readonly _handleClustering = this.createEmptyClusterElement.bind(this);
  private readonly options: HtmlOverlayToolOptions = {
    clusteringOptions: { mode: 'overlapInScreenSpace', createClusterElementCallback: this._handleClustering }
  };
  private static readonly stylesId = 'reveal-viewer-label';

  constructor(viewer: Cognite3DViewer) {
    this._htmlOverlay = new HtmlOverlayTool(viewer, this.options);
  }

  /**
   * Add a label.
   * @param position Label position.
   * @param label Label text.
   */
  add(position: THREE.Vector3, label: string): void {
    this._labelElement = this.createLabel(label);
    this._htmlOverlay.add(this._labelElement, position);
  }

  /**
   * Remove the label.
   */
  remove(): void {
    if (this._labelElement) {
      this._htmlOverlay.remove(this._labelElement);
    }
  }

  /**
   * Create and return empty HTMLDivElement.
   * @returns HTMLDivElement.
   */
  private createEmptyClusterElement() {
    return document.createElement('div');
  }

  /**
   * Load the the styles from the CSS and appends them to the label.
   * @returns Return if styles already loaded.
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

  /**
   * Create a HTML element with a string and return the element.
   * @param label String on the label.
   * @returns HTMLDivElement.
   */
  private createLabel(label: string) {
    const element = document.createElement('div');
    element.innerText = label;
    MeasurementLabel.ensureStylesLoaded();
    element.className = MeasurementLabel.stylesId;
    return element;
  }
}
