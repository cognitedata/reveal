/*!
 * Copyright 2026 Cognite AS
 */

export class WaitCursor {
  private _refCount = 0;
  private _overlay: HTMLDivElement | undefined;

  constructor(private readonly _container: HTMLElement) {}

  public refAndUpdate(): void {
    this._refCount++;
    if (this._overlay) {
      return;
    }
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;inset:0;z-index:99999;cursor:wait;';
    this._container.appendChild(overlay);
    this._overlay = overlay;
  }

  public derefAndUpdate(): void {
    this._refCount = Math.max(0, this._refCount - 1);
    if (this._refCount === 0 && this._overlay) {
      this._overlay.remove();
      this._overlay = undefined;
    }
  }

  public dispose(): void {
    if (this._overlay) {
      this._overlay.remove();
      this._overlay = undefined;
    }
    this._refCount = 0;
  }
}
