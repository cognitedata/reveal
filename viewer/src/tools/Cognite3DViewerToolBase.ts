/*!
 * Copyright 2021 Cognite AS
 */

import { assertNever } from '../utilities/assertNever';
import { EventTrigger } from '../utilities/events';

/**
 * Base class for tools attaching to a {@see Cognite3DViewer}.
 * @internal
 */
export abstract class Cognite3DViewerToolBase {
  private readonly _disposedEvent = new EventTrigger<() => void>();
  private _disposed = false;

  /**
   * Registers an event handler that is triggered when {@see Cognite3DViewerToolBase.dispose} is
   * called.
   * @param event
   * @param handler
   * @internal
   */
  on(event: 'disposed', handler: () => void) {
    switch (event) {
      case 'disposed':
        this._disposedEvent.subscribe(handler);
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
  off(event: 'disposed', handler: () => void) {
    switch (event) {
      case 'disposed':
        this._disposedEvent.unsubscribe(handler);
        break;

      default:
        assertNever(event);
    }
  }

  /**
   * Disposes the element and triggeres the 'disposed' event before clearing the list
   * of dipose-listeners.
   */
  dispose(): void {
    if (this._disposed) {
      throw new Error('Already disposed');
    }
    this._disposed = true;
    this._disposedEvent.fire();
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
