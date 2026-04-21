/*!
 * Copyright 2026 Cognite AS
 */

export class WaitCursor {
  private _count = 0;
  private _overlay: HTMLDivElement | undefined;

  constructor(private readonly _container: HTMLElement) {}

  public show(): void {
    this._count++;
    if (this._overlay) {
      return;
    }
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;inset:0;z-index:99999;cursor:wait;';
    this._container.appendChild(overlay);
    this._overlay = overlay;
  }

  public hide(): void {
    this._count = Math.max(0, this._count - 1);
    if (this._count === 0 && this._overlay) {
      this._overlay.remove();
      this._overlay = undefined;
    }
  }

  public dispose(): void {
    if (this._overlay) {
      this._overlay.remove();
      this._overlay = undefined;
    }
    this._count = 0;
  }
}
