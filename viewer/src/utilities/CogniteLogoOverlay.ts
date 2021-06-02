/*!
 * Copyright 2021 Cognite AS
 */
import css from './cogniteLogoOverlayStyles.css';

export class CogniteLogoOverlay {
  private static readonly stylesId = 'reveal-viewer-overlay-styles';
  private static readonly cssClass = 'reveal-viewer-overlay';

  private static loadStyles() {
    if (document.getElementById(CogniteLogoOverlay.stylesId)) {
      return;
    }
    const style = document.createElement('style');
    style.id = CogniteLogoOverlay.stylesId;
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  private readonly el: HTMLElement;

  constructor(parent: HTMLElement) {
    CogniteLogoOverlay.loadStyles();
    this.el = document.createElement('div');
    this.el.title = 'Cognite Reveal';
    this.el.style.position = 'absolute';
    this.el.style.bottom = '0';
    this.el.style.left = '0';

    const overlay = document.createElement('div');
    overlay.className = CogniteLogoOverlay.cssClass;
    this.el.appendChild(overlay);

    parent.style.position = 'relative';
    parent.appendChild(this.el);
  }

  dispose() {
    const styleTag = document.getElementById(CogniteLogoOverlay.stylesId);
    if (styleTag) {
      styleTag.remove();
    }
  }
}
