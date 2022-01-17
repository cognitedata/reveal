/*!
 * Copyright 2021 Cognite AS
 */

/**
 * Subscribable event source.
 */
export class EventTrigger<TEventArgs> {
  private readonly _listeners: ((eventArgs: TEventArgs) => void)[] = [];

  subscribe(listener: (eventArgs: TEventArgs) => void): void {
    this._listeners.push(listener);
  }

  unsubscribe(listener: (eventArgs: TEventArgs) => void): void {
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }

  unsubscribeAll(): void {
    this._listeners.splice(0);
  }

  fire(eventArgs: TEventArgs): void {
    this._listeners.forEach(listener => listener(eventArgs));
  }
}
