/*!
 * Copyright 2024 Cognite AS
 */

import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';

export class CommandsUpdater {
  private static _idleCallbackId: number = -1;
  private static _renderTarget: RevealRenderTarget | undefined = undefined;

  public static update(renderTarget: RevealRenderTarget | undefined): void {
    if (renderTarget === undefined) {
      return; // If this is not given, we do not know which target to update
    }
    if (this._idleCallbackId >= 0) {
      return; // Already requested
    }
    this._idleCallbackId = window.requestIdleCallback(this.onIdle);
    this._renderTarget = renderTarget;
  }

  public static onIdle = (): void => {
    if (this._renderTarget === undefined) {
      return;
    }
    // Now, update it
    this._renderTarget.commandsController.update();
    this._idleCallbackId = -1;
    this._renderTarget = undefined;
  };
}

// window.requestIdleCallback is not supported on Safari
// hence we need to add fallback with setTimeout

window.requestIdleCallback =
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  window.requestIdleCallback || customRequestIdleCallback;

function customRequestIdleCallback(
  callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void
): number {
  const start = Date.now();
  setTimeout(function () {
    callback({
      didTimeout: false,
      timeRemaining: function () {
        return Math.max(0, 50 - (Date.now() - start));
      }
    });
  }, 1);
  return 1;
}
