/*
 * Copyright 2020 Cognite AS
 */

import css from './spinnerStyles.css';

export class Spinner {
  private static readonly stylesId = 'reveal-viewer-spinner-styles';
  private static readonly cssClass = 'reveal-viewer-spinner';

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
    this.el.style.position = 'absolute';
    this.el.style.top = '0';
    this.el.style.left = '0';
    this.el.style.display = 'none';

    const spinner = document.createElement('div');
    spinner.className = Spinner.cssClass;
    this.el.appendChild(spinner);

    parent.style.position = 'relative';
    parent.appendChild(this.el);
  }

  show() {
    this.el.style.display = 'block';
  }

  hide() {
    this.el.style.display = 'none';
  }

  dispose() {
    const styleTag = document.getElementById(Spinner.stylesId);
    if (styleTag) {
      styleTag.remove();
    }
  }
}
