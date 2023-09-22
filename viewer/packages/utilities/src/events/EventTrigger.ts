/*!
 * Copyright 2021 Cognite AS
 */

/**
 * A view into an event viewer trigger
 */
export interface EventTriggerView<TListener extends (...args: any[]) => void> {
  /**
   * Get all event listeners subscribed to this trigger currently
   */
  getListeners(): TListener[];

  /**
   * Replace all currently registered listeners
   */
  replaceListeners(listeners: TListener[]): TListener[];
}

/**
 * Subscribable event source.
 */
export class EventTrigger<TListener extends (...args: any[]) => void> implements EventTriggerView<TListener> {
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

  getListeners(): TListener[] {
    return [...this._listeners];
  }

  replaceListeners(listeners: TListener[]): TListener[] {
    const oldListeners = [...this._listeners];

    this._listeners.splice(0);
    listeners.map(l => this._listeners.push(l));

    return oldListeners;
  }
}
