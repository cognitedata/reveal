/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import * as THREE from 'three';
import { HtmlOverlayTool, HtmlOverlayToolOptions } from '../HtmlOverlay/HtmlOverlayTool';
import labelCSS from './styles/Label.css';

export class MeasurementLabels {
  private readonly _htmlOverlay: HtmlOverlayTool;
  private readonly _handleClustering = this.createEmptyClusterElement.bind(this);
  private readonly options: HtmlOverlayToolOptions = {
    clusteringOptions: { mode: 'overlapInScreenSpace', createClusterElementCallback: this._handleClustering }
  };
  private static readonly stylesId = 'reveal-measurement-label';

  constructor(viewer: Cognite3DViewer) {
    this._htmlOverlay = new HtmlOverlayTool(viewer, this.options);
    MeasurementLabels.ensureStylesLoaded();
  }

  /**
   * Creates a measurement label, add it to HTMLOverlay and return the created label element.
   * @param position Label position.
   * @param label Label text.
   * @returns Label HTML element.
   */
  addLabel(position: THREE.Vector3, label: string): HTMLDivElement {
    const labelElement = this.createLabel(label);
    this._htmlOverlay.add(labelElement, position);
    return labelElement;
  }

  /**
   * Remove a label.
   * @param labelElement Label element to be removed.
   */
  removeLabel(labelElement: HTMLDivElement): void {
    if (labelElement) {
      this._htmlOverlay.remove(labelElement);
    }
  }

  /**
   * Set Style for Axis distance label.
   */
  setStyle(): void {
    if (this._htmlOverlay) {
      const style = document.getElementById(MeasurementLabels.stylesId).style;
      style.fontWeight = '300';
      style.padding = '8px';
      style.color = '#999';
    }
  }

  /**
   * Dispose all measurements labels
   */
  dispose(): void {
    this._htmlOverlay.clear();
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
  private static ensureStylesLoaded() {
    if (document.getElementById(MeasurementLabels.stylesId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = MeasurementLabels.stylesId;
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
    element.className = MeasurementLabels.stylesId;
    return element;
  }
}
