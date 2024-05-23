/*!
 * Copyright 2024 Cognite AS
 */

export type SetCounterDelegate = (counter: number) => void;

export class ActiveToolUpdater {
  // ==================================================
  // STATIC FIELDS
  // ==================================================

  private static _setCounter: SetCounterDelegate | undefined = undefined;
  private static _counter = 0;

  // ==================================================
  // STATIC METHODS
  // ==================================================

  public static setCounterDelegate(value: SetCounterDelegate | undefined): void {
    this._setCounter = value;
  }

  public static update(): void {
    // Increment the counter, so the state change in React and force a redraw each time the active tool changes
    // The reason for this it that I only want to store the active tool at one single location, since this gives a more
    // stabel code, and never goes out of sync.
    if (this._setCounter === undefined) {
      return;
    }
    this._counter++;
    this._setCounter(this._counter);
  }
}
