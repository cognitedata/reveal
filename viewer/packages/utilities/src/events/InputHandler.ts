/*!
 * Copyright 2024 Cognite AS
 */
import { getMousePosition } from './getMousePosition';
import { EventTrigger } from './EventTrigger';
import { assertNever } from '../assertNever';
import { PointerEventDelegate } from './types';
import { PointerEvents } from './PointerEvents';
import { PointerEventsTarget } from './PointerEventsTarget';

export class InputHandler extends PointerEvents {
  //================================================
  // INSTANCE FIELDS:
  //================================================

  private readonly _domElement: HTMLElement;
  private readonly _pointerEventsTarget: PointerEventsTarget;
  private readonly _clickEvents = new EventTrigger<PointerEventDelegate>();
  private readonly _hoverEvents = new EventTrigger<PointerEventDelegate>();

  //================================================
  // CONTRUCTOR:
  //================================================

  constructor(domElement: HTMLElement) {
    super();
    this._domElement = domElement;
    this._pointerEventsTarget = new PointerEventsTarget(domElement, this);
    this._pointerEventsTarget.addEventListeners();
  }

  //================================================
  // INSTANCE METHODS:
  //================================================

  dispose(): void {
    this._hoverEvents.unsubscribeAll();
    this._clickEvents.unsubscribeAll();
    this._pointerEventsTarget.removeEventListeners();
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
  // OVERRIDES of PointerEvents
  //================================================

  override async onClick(event: PointerEvent): Promise<void> {
    const position = getMousePosition(event, this._domElement);
    const firedEvent = {
      offsetX: position.x,
      offsetY: position.y,
      button: event instanceof MouseEvent ? event.button : undefined
    };
    this._clickEvents.fire(firedEvent);
    return Promise.resolve();
  }

  override onHover(event: PointerEvent): void {
    const position = getMousePosition(event, this._domElement);
    const firedEvent = {
      offsetX: position.x,
      offsetY: position.y
    };
    this._hoverEvents.fire(firedEvent);
  }

  override get isEnabled(): boolean {
    return true;
  }
}
