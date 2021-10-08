/*!
 * Copyright 2021 Cognite AS
 */

/**
 * Subscribable event source.
 */
export class EventTrigger<TListener extends (...args: any[]) => void> {
  private readonly _listeners: TListener[] = [];

  subscribe(listener: TListener): void {
    this._listeners.push(listener);
  }

  unsubscribe(listener: TListener): void {
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }

  unsubscribeAll(): void {
    this._listeners.splice(0);
  }

  fire(...args: Parameters<TListener>): void {
    this._listeners.forEach(listener => listener(...args));
  }
}
