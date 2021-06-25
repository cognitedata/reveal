/*!
 * Copyright 2021 Cognite AS
 */

import css from './spinnerStyles.css';
import svg from '!!raw-loader!./spinnerCogniteLogo.svg';

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

  updateBackgroundColor(color: { r: number; g: number; b: number }) {
    // https://en.wikipedia.org/wiki/Relative_luminance
    const { r, g, b } = color;
    const lightness = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);

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
