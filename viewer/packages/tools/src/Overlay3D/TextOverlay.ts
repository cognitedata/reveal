/*!
 * Copyright 2024 Cognite AS
 */
export class TextOverlay {
  private readonly _textOverlay: HTMLElement;
  private readonly _defaultTextOverlayToCursorOffset = 20;
  private _textOverlayVisible = false;

  constructor(domElement: HTMLElement) {
    this._textOverlay = this.createTextOverlay('', this._defaultTextOverlayToCursorOffset);
    domElement.appendChild(this._textOverlay);
  }

  get textOverlay(): HTMLElement {
    return this._textOverlay;
  }

  /**
   * Sets whether text overlay is visible.
   * Default is false.
   */
  setTextOverlayEnabled(visible: boolean): void {
    this._textOverlayVisible = visible;
    this._textOverlay.style.opacity = visible ? '1' : '0';
  }

  /**
   * Resets (i.e. hides) text overlay before recalculating position/visibility
   */
  reset(): void {
    this._textOverlay.style.opacity = '0';
  }

  /**
   * Gets whether text overlay is visible.
   */
  getTextOverlayEnabled(): boolean {
    return this._textOverlayVisible;
  }

  dispose(): void {
    this._textOverlay.remove();
  }

  public positionTextOverlay(event: MouseEvent): void {
    const { _textOverlay, _textOverlayVisible } = this;
    _textOverlay.style.left = `${event.offsetX}px`;
    _textOverlay.style.top = `${event.offsetY}px`;
    _textOverlay.style.opacity = _textOverlayVisible ? '1' : '0';
  }

  private createTextOverlay(text: string, horizontalOffset: number): HTMLElement {
    const textOverlay = document.createElement('div');
    textOverlay.innerText = text;
    textOverlay.setAttribute('class', 'text-overlay');
    textOverlay.style.cssText = `
            position: absolute;

            /* Anchor to the center of the element and ignore events */
            transform: translate(${horizontalOffset}px, -50%);
            touch-action: none;
            user-select: none;

            padding: 7px;
            max-width: 200px;
            color: #fff;
            background: #232323da;
            border-radius: 5px;
            border: '#ffffff22 solid 2px;
            opacity: 0;
            transition: opacity 0.3s;
            opacity: 0;
            z-index: 10;
            `;

    return textOverlay;
  }
}
