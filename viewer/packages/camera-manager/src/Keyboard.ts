/*!
 * Copyright 2021-2023 Cognite AS
 */

// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
// The following list is not complete, add more if needed on the caller side.
const EVENT_CODES = [
  'MetaLeft',
  'MetaRight',
  'ShiftLeft',
  'ShiftRight',
  'ControlLeft',
  'ControlRight',
  'AltLeft',
  'AltRight',
  'Escape',
  'Space',
  'ArrowLeft',
  'ArrowUp',
  'ArrowRight',
  'ArrowDown',
  'KeyA',
  'KeyB',
  'KeyC',
  'KeyD',
  'KeyE',
  'KeyF',
  'KeyQ',
  'KeyS',
  'KeyW'
] as const;

type EventCode = (typeof EVENT_CODES)[number];

const eventCodeSet = new Set(EVENT_CODES);
const isEventCode = (value: string): value is EventCode => {
  return eventCodeSet.has(value as EventCode);
};

export default class Keyboard {
  private readonly _keys = new Set<EventCode>();
  private _isEnabled = true;

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  set isEnabled(value: boolean) {
    if (this._isEnabled == value) {
      return;
    }
    this._isEnabled = value;
    this.clearPressedKeys();
  }

  public isPressed(key: EventCode): boolean {
    return this._keys.has(key);
  }

  public isShiftPressed(): boolean {
    return this.isPressed('ShiftLeft') || this.isPressed('ShiftRight');
  }

  public isShiftPressedOnly(): boolean {
    return this._keys.size === 1 && this.isShiftPressed();
  }

  public isCtrlPressed(): boolean {
    return this.isPressed('ControlLeft') || this.isPressed('ControlRight');
  }

  public isCtrlPressedOnly(): boolean {
    return this._keys.size === 1 && this.isCtrlPressed();
  }

  public isAltPressed(): boolean {
    return this.isPressed('AltLeft') || this.isPressed('AltRight');
  }

  public isMetaPressed(): boolean {
    return this.isPressed('MetaLeft') || this.isPressed('MetaRight');
  }

  /**
   * Given two keys representing positive and negative directions (e.g., left and right, or up and down),
   * this method returns 1 for the positive key, -1 for the negative key, or 0 if neither or both is pressed.
   *
   * @param positiveKey - Key representing the positive movement direction.
   * @param negativeKey - Key representing the negative movement direction.
   * @returns A value indicating the direction of movement: 1 (positive), -1 (negative), or 0 (none).
   */
  public getKeyboardMovementValue(positiveKey: EventCode, negativeKey: EventCode): number {
    return (this.isPressed(positiveKey) ? 1 : 0) - (this.isPressed(negativeKey) ? 1 : 0);
  }

  public addEventListeners(domElement: HTMLElement): void {
    this.clearPressedKeys();
    domElement.addEventListener('keydown', this.onKeyDown);
    domElement.addEventListener('keyup', this.onKeyUp);
    domElement.addEventListener('blur', this.clearPressedKeys);
    domElement.addEventListener('focus', this.clearPressedKeys);
  }

  public removeEventListeners(domElement: HTMLElement): void {
    this.clearPressedKeys();
    domElement.removeEventListener('keydown', this.onKeyDown);
    domElement.removeEventListener('keyup', this.onKeyUp);
    domElement.removeEventListener('blur', this.clearPressedKeys);
    domElement.removeEventListener('focus', this.clearPressedKeys);
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => this.onKey(event, true);
  private readonly onKeyUp = (event: KeyboardEvent): void => this.onKey(event, false);

  public onKey(event: KeyboardEvent, down: boolean): void {
    if (!this.isEnabled) {
      return;
    }
    if (!isEventCode(event.code)) {
      return;
    }
    if (down) this._keys.add(event.code);
    else this._keys.delete(event.code);
  }

  public readonly clearPressedKeys = (): void => {
    this._keys.clear();
  };
}
