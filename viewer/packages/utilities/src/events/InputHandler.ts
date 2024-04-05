/*!
 * Copyright 2024 Cognite AS
 */
import { clickOrTouchEventOffset } from './clickOrTouchEventOffset';
import { EventTrigger } from './EventTrigger';
import { assertNever } from '../assertNever';
import { PointerEventDelegate } from './types';
import { IPointerEvents } from './IPointerEvents';
import { PointerEventsDetector } from './PointerEventsDetector';

export class InputHandler implements IPointerEvents {
  private readonly _domElement: HTMLElement;
  private readonly _pointerEventsDetector: PointerEventsDetector;
  private readonly _clickEvents = new EventTrigger<PointerEventDelegate>();
  private readonly _hoverEvents = new EventTrigger<PointerEventDelegate>();

  constructor(domElement: HTMLElement) {
    this._domElement = domElement;
    this._pointerEventsDetector = new PointerEventsDetector(domElement, this);
    this._pointerEventsDetector.addEventListeners();
  }

  dispose(): void {
    this._hoverEvents.unsubscribeAll();
    this._clickEvents.unsubscribeAll();
    this._pointerEventsDetector.removeEventListeners();
  }

  /**
   * @example
   * ```js
   * const onClick = (event) => { console.log(event.offsetX, event.offsetY) };
   * viewer.on('click', onClick);
   * ```
   */
  on(event: 'click' | 'hover', callback: PointerEventDelegate): void {
    switch (event) {
      case 'click':
        this._clickEvents.subscribe(callback);
        break;

      case 'hover':
        this._hoverEvents.subscribe(callback);
        break;

      default:
        assertNever(event);
    }
  }

  off(event: 'click' | 'hover', callback: PointerEventDelegate): void {
    switch (event) {
      case 'click':
        this._clickEvents.unsubscribe(callback);
        break;

      case 'hover':
        this._hoverEvents.unsubscribe(callback);
        break;

      default:
        assertNever(event);
    }
  }

  //================================================
  // IMPLEMENTATION OF IPointerEvents
  //================================================

  onClick(event: PointerEvent): void {
    const firedEvent = {
      ...clickOrTouchEventOffset(event, this._domElement),
      button: event instanceof MouseEvent ? event.button : undefined
    };
    this._clickEvents.fire(firedEvent);
  }

  onHover(event: PointerEvent): void {
    const firedEvent = clickOrTouchEventOffset(event, this._domElement);
    this._hoverEvents.fire(firedEvent);
  }

  onDoubleClick(_event: PointerEvent): void {
    // Not implemented
  }

  get isEnabled(): boolean {
    return true;
  }
}
