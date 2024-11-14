/*!
 * Copyright 2024 Cognite AS
 */
import { getPixelCoordinatesFromEvent } from './getPixelCoordinatesFromEvent';
import debounce from 'lodash/debounce';
import { Vector2, MOUSE } from 'three';
import { PointerEvents } from './PointerEvents';

const MAX_MOVE_DISTANCE_DURING_CLICK = 8;
const MAX_CLICK_DURATION = 250;
const DOUBLE_CLICK_INTERVAL = 300;
const HOVER_INTERVAL = 100;

/**
 * This class fires click, double click, hover end similar events at a PointerEvents
 * onClick will fired if it's a single click, and the mouse hasn't move too much
 * If onDoubleClick is fired, the onClick will not be fired
 * onHover will be fired only if the mouse button is not pressed and not to often
 * If mouse, the onDoubleClick and onClick is fired when the left mouse button is pressed
 * onPointerDrag will be fired wnen the mouse button is pressed and the mouse is moving
 * @beta
 */
export class PointerEventsTarget {
  //================================================
  // INSTANCE FIELDS
  //================================================

  private readonly _domElement: HTMLElement;
  private readonly _events: PointerEvents;
  private _downPosition: Vector2 | undefined = undefined;

  private _lastDownTimestamp = 0; // Time of last pointer down event
  private _prevDownTimestamp = 0; // Time of previous pointer down event
  private _clickCounter = 0; // Incremented at each onPointerDown
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
    this._domElement.addEventListener('pointermove', this.onHover);
    window.addEventListener('pointermove', this.onPointerDrag);
    window.addEventListener('pointerup', this.onPointerUp);
  }

  public removeEventListeners(): void {
    this._domElement.removeEventListener('pointerdown', this.onPointerDown);
    this._domElement.removeEventListener('pointermove', this.onHover);
    window.removeEventListener('pointermove', this.onPointerDrag);
    window.removeEventListener('pointerup', this.onPointerUp);
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
    this._domElement.focus();

    const leftButton = isTouch(event) || isLeftMouseButton(event);

    this._downPosition = getPixelCoordinatesFromEvent(event, this._domElement);
    this._prevDownTimestamp = this._lastDownTimestamp;
    this._lastDownTimestamp = event.timeStamp;
    this._clickCounter++;

    await this._events.onPointerDown(event, leftButton);
    this._isLeftDown = leftButton;
  };

  private readonly onHover = debounce((event: PointerEvent) => {
    if (!this.isEnabled) {
      return;
    }
    if (isAnyMouseButtonPressed(event)) {
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
    if (isMouse(event)) {
      if (!isAnyMouseButtonPressed(event)) {
        return;
      }
      if (event.movementX === 0 && event.movementY === 0) {
        return;
      }
    }
    await this._events.onPointerDrag(event, this._isLeftDown);
  };

  private readonly onPointerUp = async (event: PointerEvent) => {
    if (!this.isEnabled) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();

    if (this._downPosition === undefined) {
      return;
    }
    await this._events.onPointerUp(event, this._isLeftDown);

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
    const position = getPixelCoordinatesFromEvent(event, this._domElement);
    const distance = position.distanceTo(this._downPosition);
    return distance < MAX_MOVE_DISTANCE_DURING_CLICK;
  }

  private isDoubleClick(): boolean {
    if (this._prevDownTimestamp <= 0) {
      return false;
    }
    const interval = this._lastDownTimestamp - this._prevDownTimestamp;
    return interval < DOUBLE_CLICK_INTERVAL;
  }
}

function isAnyMouseButtonPressed(event: PointerEvent): boolean {
  return event.buttons !== 0;
}

function isLeftMouseButton(event: PointerEvent): boolean {
  return event.button === MOUSE.LEFT;
}

function isMouse(event: PointerEvent): boolean {
  return event.pointerType === 'mouse';
}

function isTouch(event: PointerEvent): boolean {
  return event.pointerType === 'touch';
}
