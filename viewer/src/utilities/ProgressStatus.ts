/*!
 * Copyright 2020 Cognite AS
 */

import { Progress } from './types';

export class ProgressStatus {
  private readonly _htmlElement: HTMLElement;
  constructor(parent: HTMLElement) {
    this._htmlElement = document.createElement('div');
    this.setStyle(this._htmlElement.style);
    parent.appendChild(this._htmlElement);
  }

  update(progress: Progress) {
    if (progress.remaining == 0) {
      this.hide();
    } else {
      this.show();
      this._htmlElement.title = `Downloaded: ${progress.completed}/${progress.total} sectors`;
    }
  }

  private setStyle(style: CSSStyleDeclaration) {
    style.top = '0';
    style.left = '0';
  }

  private show() {
    this._htmlElement.style.display = 'block';
  }

  private hide() {
    this._htmlElement.style.display = 'none';
  }
}
