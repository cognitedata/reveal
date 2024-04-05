/*!
 * Copyright 2024 Cognite AS
 */
import { clickOrTouchEventOffset } from './clickOrTouchEventOffset';
import debounce from 'lodash/debounce';
import { Vector2 } from 'three';
import { IPointerEvents } from './IPointerEvents';

const MAX_MOVE_DISTANCE = 8;
const MAX_CLICK_DURATION = 250;
const DOUBLE_CLICK_INTERVAL = 300;
const HOVER_INTERVAL = 100;

/**
 * This class fires click, double click and hover events at a IPointerEvents
 * Click will fired if it is a single click, and the mouse hasn't move too much
 * If double click is fired, the click will not be fired
 * Hover will be fired only if the mouse button is not pressed and not to often
 */
export class PointerEventsDetector {
  private readonly _domElement: HTMLElement;
  private readonly _events: IPointerEvents;
  private readonly _downPosition: Vector2 = new Vector2();
  private _lastDownTimestamp = 0; // Time of last pointer down event
  private _prevDownTimestamp = 0; // Time of previous pointer down event
  private _clickCounter = 0; // Incremented at each onPointerDown

  //================================================
  // CONTRUCTOR
  //================================================

  constructor(domElement: HTMLElement, events: IPointerEvents) {
    this._domElement = domElement;
    this._events = events;
  }

  //================================================
  // INSTANCE METHODS: Public
  //================================================

  public addEventListeners(): void {
    this._domElement.addEventListener('pointerdown', this.onPointerDown);
    this._domElement.addEventListener('pointermove', this.onPointerMove);
  }

  public removeEventListeners(): void {
    this._domElement.removeEventListener('pointerdown', this.onPointerDown);
    this._domElement.removeEventListener('pointermove', this.onPointerMove);
  }

  //================================================
  // EVENTS
  //================================================

  private readonly onPointerDown = (event: PointerEvent) => {
    const { offsetX, offsetY } = clickOrTouchEventOffset(event, this._domElement);
    this._downPosition.set(offsetX, offsetY);
    this._prevDownTimestamp = this._lastDownTimestamp;
    this._lastDownTimestamp = event.timeStamp;
    this._clickCounter++;

    this._domElement.addEventListener('pointerup', this.onPointerUp);
    this._domElement.removeEventListener('pointermove', this.onPointerMove);
  };

  private readonly onPointerMove = debounce((event: PointerEvent) => {
    this._events.onHover(event);
  }, HOVER_INTERVAL);

  private readonly onPointerUp = (event: PointerEvent) => {
    if (this._downPosition === undefined) {
      return;
    }
    this._domElement.removeEventListener('pointerup', this.onPointerUp);
    this._domElement.addEventListener('pointermove', this.onPointerMove);

    if (!this.isProperClick(event)) {
      return;
    }
    if (this.isDoubleClick()) {
      this._events.onDoubleClick(event);
      return;
    }
    const currentClickCounter = this._clickCounter;
    setTimeout(() => {
      // If the clickCounter has changed, it means that another click event has been fired in the meantime
      if (currentClickCounter === this._clickCounter) {
        this._events.onClick(event);
      }
    }, DOUBLE_CLICK_INTERVAL);
  };

  //================================================
  // INSTANCE METHODS: Requests
  //================================================

  private isProperClick(event: PointerEvent) {
    if (this._downPosition === undefined) {
      return;
    }
    const clickDuration = event.timeStamp - this._lastDownTimestamp;
    if (clickDuration >= MAX_CLICK_DURATION) {
      return false;
    }
    const { offsetX, offsetY } = clickOrTouchEventOffset(event, this._domElement);
    const distance = Math.sqrt(offsetX - this._downPosition.x) ** 2 + (offsetY - this._downPosition.y) ** 2;

    return distance < MAX_MOVE_DISTANCE;
  }

  private isDoubleClick() {
    if (this._prevDownTimestamp <= 0) {
      return false;
    }
    const interval = this._lastDownTimestamp - this._prevDownTimestamp;
    return interval < DOUBLE_CLICK_INTERVAL;
  }
}
