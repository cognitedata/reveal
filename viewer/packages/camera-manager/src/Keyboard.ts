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

export type EventCode = (typeof EVENT_CODES)[number];

export default class Keyboard {
  private readonly _keys = new Set<string>();
  private _disabled = false;
  private readonly _domElement: HTMLElement;

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(isDisabled: boolean) {
    this._disabled = isDisabled;
    if (isDisabled) {
      this.removeEventListeners();
    } else {
      this.addEventListeners();
    }
  }

  constructor(domElement: HTMLElement) {
    this._domElement = domElement;
    this.addEventListeners();
  }

  public isPressed(key: EventCode): boolean {
    return this._keys.has(key);
  }

  public isShiftPressed(): boolean {
    return this.isPressed('ShiftLeft') || this.isPressed('ShiftRight');
  }

  public isCtrlPressed(): boolean {
    return this.isPressed('ControlLeft') || this.isPressed('ControlRight');
  }

  public isAltPressed(): boolean {
    return this.isPressed('AltLeft') || this.isPressed('AltRight');
  }

  public isMetaPressed(): boolean {
    return this.isPressed('MetaLeft') || this.isPressed('MetaRight');
  }

  public dispose(): void {
    this.clearPressedKeys();
    this.removeEventListeners();
  }

  private readonly addEventListeners = () => {
    this.clearPressedKeys();
    this._domElement.addEventListener('keydown', this.onKeyDown);
    this._domElement.addEventListener('keyup', this.onKeyUp);
    this._domElement.addEventListener('blur', this.clearPressedKeys);
  };

  private readonly removeEventListeners = () => {
    this._domElement.removeEventListener('keydown', this.onKeyDown);
    this._domElement.removeEventListener('keyup', this.onKeyUp);
    this._domElement.removeEventListener('blur', this.clearPressedKeys);
  };

  private readonly onKeyDown = (event: KeyboardEvent) => {
    this._keys.add(event.code);
  };

  private readonly onKeyUp = (event: KeyboardEvent) => {
    this._keys.delete(event.code);
  };

  private readonly clearPressedKeys = () => {
    this._keys.clear();
  };
}
