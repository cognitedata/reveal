/*!
 * Copyright 2021 Cognite AS
 */
import { clickOrTouchEventOffset } from './clickOrTouchEventOffset';
import { EventTrigger } from './EventTrigger';
import debounce from 'lodash/debounce';
import { assertNever } from '../assertNever';
import { Vector2 } from 'three';
import { PointerEventDelegate } from './types';

export type EventCollection = { [eventName: string]: EventTrigger<(...args: any[]) => void> };

export class InputHandler {
  private readonly domElement: HTMLElement;
  private static readonly maxMoveDistance = 8;
  private static readonly maxClickDuration = 250;

  private readonly _events = {
    click: new EventTrigger<PointerEventDelegate>(),
    hover: new EventTrigger<PointerEventDelegate>()
  };

  constructor(domElement: HTMLElement) {
    this.domElement = domElement;

    this.setupEventListeners();
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
        this._events.click.subscribe(callback as PointerEventDelegate);
        break;

      case 'hover':
        this._events.hover.subscribe(callback as PointerEventDelegate);
        break;
      default:
        assertNever(event);
    }
  }

  off(event: 'click' | 'hover', callback: PointerEventDelegate): void {
    switch (event) {
      case 'click':
        this._events.click.unsubscribe(callback as PointerEventDelegate);
        break;

      case 'hover':
        this._events.hover.unsubscribe(callback as PointerEventDelegate);
        break;
      default:
        assertNever(event);
    }
  }

  dispose(): void {
    disposeOfAllEventListeners(this._events);
  }

  private setupEventListeners() {
    const { domElement } = this;

    let pointerDown = false;
    let pointerDownTimestamp = 0;
    let validClick = false;

    const startOffset = new Vector2();

    const onUp = (e: MouseEvent | TouchEvent) => {
      this.handleClickEvent(e, startOffset, pointerDown, validClick, pointerDownTimestamp);

      pointerDown = false;
      validClick = false;

      // up
      domElement.removeEventListener('mouseup', onUp);
      domElement.removeEventListener('touchend', onUp);

      // add back onHover
      domElement.addEventListener('mousemove', this.onHoverCallback);
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
      pointerDown = true;
      validClick = true;
      pointerDownTimestamp = e.timeStamp;

      const { offsetX, offsetY } = clickOrTouchEventOffset(e, domElement);
      startOffset.set(offsetX, offsetY);

      // up
      domElement.addEventListener('mouseup', onUp);
      domElement.addEventListener('touchend', onUp);

      // no more onHover
      domElement.removeEventListener('mousemove', this.onHoverCallback);
    };

    // down
    domElement.addEventListener('mousedown', onDown);
    domElement.addEventListener('touchstart', onDown);

    // on hover callback
    domElement.addEventListener('mousemove', this.onHoverCallback);
  }

  private isProperClick(
    e: MouseEvent | TouchEvent,
    startOffset: Vector2,
    pointerDown: boolean,
    validClick: boolean,
    pointerDownTimestamp: number
  ) {
    const { offsetX, offsetY } = clickOrTouchEventOffset(e, this.domElement);
    const clickDuration = e.timeStamp - pointerDownTimestamp;

    const hasMovedDuringClick =
      Math.abs(offsetX - startOffset.x) + Math.abs(offsetY - startOffset.y) > InputHandler.maxMoveDistance;

    const isProperClick =
      pointerDown && validClick && clickDuration < InputHandler.maxClickDuration && !hasMovedDuringClick;

    return isProperClick;
  }

  private handleClickEvent(
    e: MouseEvent | TouchEvent,
    startOffset: Vector2,
    pointerDown: boolean,
    validClick: boolean,
    pointerDownTimestamp: number
  ) {
    const isProperClick = this.isProperClick(e, startOffset, pointerDown, validClick, pointerDownTimestamp);

    if (isProperClick) {
      const firedEvent = {
        ...clickOrTouchEventOffset(e, this.domElement),
        button: e instanceof MouseEvent ? e.button : undefined
      };

      this._events.click.fire(firedEvent);
    }
  }

  private readonly onHoverCallback = debounce((e: MouseEvent) => {
    this._events.hover.fire(clickOrTouchEventOffset(e, this.domElement));
  }, 100);
}

/**
 * Method for deleting all external events that are associated with current instance of a class.
 */
export function disposeOfAllEventListeners(eventList: EventCollection): void {
  for (const eventType of Object.keys(eventList)) {
    eventList[eventType].unsubscribeAll();
  }
}
