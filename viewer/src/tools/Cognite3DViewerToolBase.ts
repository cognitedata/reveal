/*!
 * Copyright 2021 Cognite AS
 */

import { assertNever } from '../utilities/assertNever';
import { Cognite3DViewerTool, DisposedDelegate } from '../public/migration/Cognite3DViewerTool';

/**
 * Base class for tools attaching to a {@see Cognite3DViewer}.
 * @internal
 */
export abstract class Cognite3DViewerToolBase implements Cognite3DViewerTool {
  private readonly _disposedListeners = new Set<DisposedDelegate>();
  private _disposed = false;

  /**
   * Registers an event handler that is triggered when {@see Cognite3DViewerToolBase.dispose} is
   * called.
   * @param event
   * @param handler
   * @internal
   */
  on(event: 'disposed', handler: DisposedDelegate) {
    switch (event) {
      case 'disposed':
        if (this._disposedListeners.has(handler)) {
          throw new Error('Handler has already been added');
        }
        this._disposedListeners.add(handler);
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
  off(event: 'disposed', handler: DisposedDelegate) {
    switch (event) {
      case 'disposed':
        const wasRemoved = this._disposedListeners.delete(handler);
        if (!wasRemoved) {
          throw new Error('Handler is not added');
        }
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
    this._disposedListeners.forEach(h => h());
    this._disposedListeners.clear();
  }

  /**
   * Throws an error if the instance has been disposed.
   */
  protected ensureNotDisposed(): void {
    if (this._disposed) {
      throw new Error('The tool has been disposed');
    }
  }

  /**
   * @internal
   */
  abstract notifyRendered(): void;
}
