/*!
 * Copyright 2021 Cognite AS
 */

import css from './spinnerStyles.css';
import svg from '!!raw-loader!./spinnerCogniteLogo.svg';
import * as THREE from 'three';
import {v4} from 'uuid';

import { assertNever } from '@reveal/utilities';

export type Corner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export class Spinner {
  private readonly stylesId = `reveal-viewer-spinner-styles-${v4()}`;
  private static readonly classnames = {
    base: 'reveal-viewer-spinner',
    topLeft: 'reveal-viewer-spinner-top-left',
    topRight: 'reveal-viewer-spinner-top-right',
    bottomLeft: 'reveal-viewer-spinner-bottom-left',
    bottomRight: 'reveal-viewer-spinner-bottom-right',
    loading: 'reveal-viewer-spinner--loading',
    dark: 'reveal-viewer-spinner--dark'
  };
  private static readonly titles = {
    idle: process.env.VERSION!,
    loading: `${process.env.VERSION!} Loading...`
  };

  private _loading = false;

  private static loadStyles(stylesId: string) {
    if (document.getElementById(stylesId)) {
      return;
    }
    const style = document.createElement('style');
    style.id = stylesId;
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  private readonly el: HTMLElement;

  constructor(parent: HTMLElement) {
    Spinner.loadStyles(this.stylesId);
    this.el = document.createElement('div');
    this.el.title = Spinner.titles.idle;

    this.el.className = Spinner.classnames.base;
    this.el.classList.add(Spinner.classnames.topLeft);
    this.el.innerHTML = svg;

    parent.style.position = 'relative';
    parent.appendChild(this.el);
  }

  set placement(placement: Corner) {
    this.el.classList.remove(
      Spinner.classnames.bottomLeft,
      Spinner.classnames.bottomRight,
      Spinner.classnames.topLeft,
      Spinner.classnames.topRight
    );

    switch (placement) {
      case 'topLeft':
        this.el.classList.add(Spinner.classnames.topLeft);
        break;
      case 'topRight':
        this.el.classList.add(Spinner.classnames.topRight);
        break;
      case 'bottomLeft':
        this.el.classList.add(Spinner.classnames.bottomLeft);
        break;
      case 'bottomRight':
        this.el.classList.add(Spinner.classnames.bottomRight);
        break;
      default:
        assertNever(placement, `Invalid placement: ${placement}`);
    }
  }

  set opacity(fractionOpacity: number) {
    this.el.style.opacity = `${fractionOpacity}`;
  }

  get loading(): boolean {
    return this._loading;
  }

  set loading(loadingState: boolean) {
    this._loading = loadingState;
    if (loadingState) {
      this.el.classList.add(Spinner.classnames.loading);
      this.el.title = Spinner.titles.loading;
    } else {
      this.el.classList.remove(Spinner.classnames.loading);
      this.el.title = Spinner.titles.idle;
    }
  }

  /**
   * Pass background cover of the viewer to adjust Logo color
   * @param color
   * @param color.r 0..1 red
   * @param color.g 0..1 green
   * @param color.b 0..1 blue
   */
  updateBackgroundColor(color: Pick<THREE.Color, 'getHSL'>): void {
    const { l: lightness } = color.getHSL({ h: 0, s: 0, l: 0 });

    if (lightness > 0.5) {
      this.el.classList.add(Spinner.classnames.dark);
    } else {
      this.el.classList.remove(Spinner.classnames.dark);
    }
  }

  dispose(): void {
    this.el.remove();
    const styleTag = document.getElementById(this.stylesId);
    if (styleTag) {
      styleTag.remove();
    }
  }
}
