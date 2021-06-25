/*!
 * Copyright 2021 Cognite AS
 */

import css from './spinnerStyles.css';
import svg from '!!raw-loader!./spinnerCogniteLogo.svg';
import * as THREE from 'three';

export class Spinner {
  private static readonly stylesId = 'reveal-viewer-spinner-styles';
  static classnames = {
    base: 'reveal-viewer-spinner',
    loading: 'reveal-viewer-spinner--loading',
    dark: 'reveal-viewer-spinner--dark'
  };

  private _loading = false;

  private static loadStyles() {
    if (document.getElementById(Spinner.stylesId)) {
      return;
    }
    const style = document.createElement('style');
    style.id = Spinner.stylesId;
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  private readonly el: HTMLElement;

  constructor(parent: HTMLElement) {
    Spinner.loadStyles();
    this.el = document.createElement('div');
    this.el.title = 'Loading...';

    this.el.className = Spinner.classnames.base;
    this.el.innerHTML = svg;

    parent.style.position = 'relative';
    parent.appendChild(this.el);
  }

  get loading() {
    return this._loading;
  }

  set loading(loadingState: boolean) {
    this._loading = loadingState;
    if (loadingState) {
      this.el.classList.add(Spinner.classnames.loading);
    } else {
      this.el.classList.remove(Spinner.classnames.loading);
    }
  }

  /**
   * Pass background cover of the viewer to adjust Logo color
   * @param color
   * @param color.r 0..1 red
   * @param color.g 0..1 green
   * @param color.b 0..1 blue
   */
  updateBackgroundColor(color: Pick<THREE.Color, 'getHSL'>) {
    const { l: lightness } = color.getHSL({ h: 0, s: 0, l: 0 });

    if (lightness > 0.5) {
      this.el.classList.add(Spinner.classnames.dark);
    } else {
      this.el.classList.remove(Spinner.classnames.dark);
    }
  }

  dispose() {
    this.el.remove();
    const styleTag = document.getElementById(Spinner.stylesId);
    if (styleTag) {
      styleTag.remove();
    }
  }
}
