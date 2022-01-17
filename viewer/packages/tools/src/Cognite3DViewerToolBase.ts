/*!
 * Copyright 2021 Cognite AS
 */

import { assertNever, EventTrigger } from '@reveal/core/utilities';
import { EmptyEvent } from '@reveal/utilities';

/**
 * Base class for tools attaching to a {@see Cognite3DViewer}.
 */
export abstract class Cognite3DViewerToolBase {
  private readonly _disposedEvent = new EventTrigger<EmptyEvent>();
  private _disposed = false;

  /**
   * Registers an event handler that is triggered when {@see Cognite3DViewerToolBase.dispose} is
   * called.
   * @param event
   * @param listener
   * @internal
   */
  on(event: 'disposed', listener: () => void): void {
    switch (event) {
      case 'disposed':
        this._disposedEvent.subscribe(listener);
        break;

      default:
        assertNever(event);
    }
  }

  /**
   * Unregisters an event handler for the 'disposed'-event.
   * @param event
   * @param handler
   */
  off(event: 'disposed', listener: () => void): void {
    switch (event) {
      case 'disposed':
        this._disposedEvent.unsubscribe(listener);
        break;

      default:
        assertNever(event);
    }
  }

  /**
   * Disposes the element and triggers the 'disposed' event before clearing the list
   * of dispose-listeners.
   */
  dispose(): void {
    if (this._disposed) {
      throw new Error('Already disposed');
    }
    this._disposed = true;
    this._disposedEvent.fire(null);
    this._disposedEvent.unsubscribeAll();
  }

  /**
   * Throws an error if the instance has been disposed.
   */
  protected ensureNotDisposed(): void {
    if (this._disposed) {
      throw new Error('The tool has been disposed');
    }
  }
}
