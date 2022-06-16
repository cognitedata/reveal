/*!
 * Copyright 2022 Cognite AS
 */

import labelCSS from './styles/Label.css';

export class MeasurementLabels {
  static readonly stylesId = 'reveal-measurement-label';

  constructor() {
    MeasurementLabels.ensureStylesLoaded();
  }

  /**
   * Create a HTML element with a string and return the element.
   * @param label String on the label.
   * @returns HTMLDivElement.
   */
  createLabel(label: string): HTMLDivElement {
    const element = document.createElement('div');
    element.innerText = label;
    element.className = MeasurementLabels.stylesId;
    return element;
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
}
