/*!
 * Copyright 2024 Cognite AS
 */
import { clickOrTouchEventOffset } from './clickOrTouchEventOffset';
import debounce from 'lodash/debounce';
import { Vector2, MOUSE } from 'three';
import { PointerEvents } from './PointerEvents';

const MAX_MOVE_DISTANCE = 8;
const MAX_CLICK_DURATION = 250;
const DOUBLE_CLICK_INTERVAL = 300;
const HOVER_INTERVAL = 100;

/**
 * This class fires click, double click and hover events at a PointerEvents
 * Click will fired if it's a single click, and the mouse hasn't move too much
 * If double click is fired, the click will not be fired
 * Hover will be fired only if the mouse button is not pressed and not to often
 */
export class PointerEventsTarget {
  //================================================
  // INSTANCE FIELDS
  //================================================

  private readonly _domElement: HTMLElement;
  private readonly _events: PointerEvents;
  private readonly _downPosition: Vector2 = new Vector2();

  private _lastDownTimestamp = 0; // Time of last pointer down event
  private _prevDownTimestamp = 0; // Time of previous pointer down event
  private _clickCounter = 0; // Incremented at each onPointerDown
  private _isDragging = false;
  private _isLeftDown = false;

  //================================================
  // INSTANCE PROPERIES
  //================================================

  private get isEnabled(): boolean {
    return this._events.isEnabled;
  }

  //================================================
  // CONTRUCTOR
  //================================================

  constructor(domElement: HTMLElement, events: PointerEvents) {
    this._domElement = domElement;
    this._events = events;
  }

  //================================================
  // INSTANCE METHODS: Public
  //================================================

  public addEventListeners(): void {
    this._domElement.addEventListener('pointerdown', this.onPointerDown);
    this._domElement.addEventListener('pointermove', this.onPointerHover);
    window.addEventListener('pointermove', this.onPointerDrag);
  }

  public removeEventListeners(): void {
    this._domElement.removeEventListener('pointerdown', this.onPointerDown);
    this._domElement.removeEventListener('pointermove', this.onPointerHover);
    window.removeEventListener('pointermove', this.onPointerDrag);
  }

  //================================================
  // EVENTS
  //================================================

  private readonly onPointerDown = async (event: PointerEvent) => {
    if (!this.isEnabled) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();

    const leftButton = isLeftMouseButton(event);

    const { offsetX, offsetY } = clickOrTouchEventOffset(event, this._domElement);
    this._downPosition.set(offsetX, offsetY);
    this._prevDownTimestamp = this._lastDownTimestamp;
    this._lastDownTimestamp = event.timeStamp;
    this._clickCounter++;

    await this._events.onPointerDown(event, leftButton);
    this._isDragging = true;
    this._isLeftDown = leftButton;

    window.addEventListener('pointerup', this.onPointerUp);
    this._domElement.removeEventListener('pointermove', this.onPointerHover);
  };

  private readonly onPointerHover = debounce((event: PointerEvent) => {
    if (!this.isEnabled) {
      return;
    }
    this._events.onHover(event);
  }, HOVER_INTERVAL);

  private readonly onPointerDrag = async (event: PointerEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (!this.isEnabled) {
      return;
    }
    if (!isMouseButtonPressed(event)) {
      if (this._isDragging) {
        this.onPointerUp(event);
      }
      return;
    }
    if (event.movementX === 0 && event.movementX === 0) {
      return;
    }
    if (this._isDragging) {
      await this._events.onPointerDrag(event, this._isLeftDown);
    }
  };

  private readonly onPointerUp = async (event: PointerEvent) => {
    if (!this.isEnabled) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();

    this._isDragging = false;
    if (this._downPosition === undefined) {
      return;
    }
    await this._events.onPointerUp(event, this._isLeftDown);
    window.removeEventListener('pointerup', this.onPointerUp);
    this._domElement.addEventListener('pointermove', this.onPointerHover);

    if (!isLeftMouseButton(event)) {
      return;
    }
    if (!this.isProperClick(event)) {
      return;
    }
    if (this.isDoubleClick()) {
      await this._events.onDoubleClick(event);
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

  private isProperClick(event: PointerEvent): boolean {
    if (this._downPosition === undefined) {
      return false;
    }
    const clickDuration = event.timeStamp - this._lastDownTimestamp;
    if (clickDuration >= MAX_CLICK_DURATION) {
      return false;
    }
    const { offsetX, offsetY } = clickOrTouchEventOffset(event, this._domElement);
    const distance = Math.sqrt(offsetX - this._downPosition.x) ** 2 + (offsetY - this._downPosition.y) ** 2;

    return distance < MAX_MOVE_DISTANCE;
  }

  private isDoubleClick(): boolean {
    if (this._prevDownTimestamp <= 0) {
      return false;
    }
    const interval = this._lastDownTimestamp - this._prevDownTimestamp;
    return interval < DOUBLE_CLICK_INTERVAL;
  }
}

function isMouseButtonPressed(event: PointerEvent): boolean {
  return event.buttons !== 0;
}

function isLeftMouseButton(event: PointerEvent): boolean {
  return event.button === MOUSE.LEFT;
}
