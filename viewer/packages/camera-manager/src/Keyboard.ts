/*!
 * Copyright 2021 Cognite AS
 */

const keyMap: { [s: string]: string } = {
  16: 'shift',
  17: 'ctrl',
  18: 'alt',
  27: 'escape',
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  65: 'a',
  66: 'b',
  67: 'c',
  68: 'd',
  69: 'e',
  70: 'f',
  81: 'q',
  83: 's',
  87: 'w'
};

export default class Keyboard {
  private keys: { [s: string]: number } = {};
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

  public isPressed(key: string): boolean {
    return this.keys[key] >= 1;
  }

  public comsumePressed(key: string): boolean {
    const p = this.keys[key] === 2;
    if (p) {
      this.keys[key] = 1;
    }
    return p;
  }

  public dispose(): void {
    this.clearPressedKeys();
    this.removeEventListeners();
  }

  private readonly addEventListeners = () => {
    this.clearPressedKeys();

    this._domElement.addEventListener('keydown', this.onKeydown);
    this._domElement.addEventListener('keyup', this.onKeyup);
    this._domElement.addEventListener('blur', this.clearPressedKeys);
  };

  private readonly removeEventListeners = () => {
    this._domElement.removeEventListener('keydown', this.onKeydown);
    this._domElement.removeEventListener('keyup', this.onKeyup);
    this._domElement.removeEventListener('blur', this.clearPressedKeys);
  };

  private readonly onKeydown = (event: KeyboardEvent) => {
    if (event.metaKey || event.altKey || event.ctrlKey) {
      return;
    }

    if (event.keyCode in keyMap) {
      if (this.keys[keyMap[event.keyCode]] === 0) {
        this.keys[keyMap[event.keyCode]] = 2;
      }
      event.preventDefault();
    }
  };

  private readonly onKeyup = (event: KeyboardEvent) => {
    if (event.keyCode in keyMap) {
      this.keys[keyMap[event.keyCode]] = 0;
    }
  };

  private readonly clearPressedKeys = () => {
    Object.keys(keyMap).forEach((key: string) => {
      this.keys[keyMap[key]] = 0;
    });
  };
}
