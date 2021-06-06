/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import css from './cogniteLogoOverlayStyles.css';

export class CogniteLogoOverlay {
  private readonly _overlay: HTMLElement;

  private static readonly stylesElementId = 'reveal-viewer-overlay-styles';

  private static loadStyles() {
    if (document.getElementById(CogniteLogoOverlay.stylesElementId)) {
      return;
    }
    const style = document.createElement('style');
    style.id = CogniteLogoOverlay.stylesElementId;
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  private readonly el: HTMLElement;

  constructor(parent: HTMLElement, viewerBackgroundColor: THREE.Color) {
    CogniteLogoOverlay.loadStyles();
    this.el = document.createElement('div');
    this.el.title = 'Cognite Reveal';
    this.el.style.position = 'absolute';
    this.el.style.bottom = '0';
    this.el.style.left = '0';

    this._overlay = document.createElement('div');
    this.updateStyle(viewerBackgroundColor);
    this._overlay.className = determineCssClass(new THREE.Color('black'));
    this.el.appendChild(this._overlay);

    parent.style.position = 'relative';
    parent.appendChild(this.el);
  }

  updateStyle(viewerBackgroundColor: THREE.Color) {
    this._overlay.className = determineCssClass(viewerBackgroundColor);
  }

  dispose() {
    const styleTag = document.getElementById(CogniteLogoOverlay.stylesElementId);
    if (styleTag) {
      styleTag.remove();
    }
  }
}

function determineLightness(color: THREE.Color): number {
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  return hsl.l;
}

function determineCssClass(backgroundColor: THREE.Color): string {
  debugger;
  const lightness = determineLightness(backgroundColor);
  const logoClass = lightness > 0.5 ? 'cognite-logo-light-bg' : 'cognite-logo-dark-bg';
  return `reveal-viewer-overlay ${logoClass}`;
}
