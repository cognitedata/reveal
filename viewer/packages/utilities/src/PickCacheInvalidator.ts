/*!
 * Copyright 2026 Cognite AS
 */

/**
 * Flag for whether the cached picking results are stale. Set it with {@link PickCacheInvalidator.request} wherever
 * something that can change what a pick hits changes (models, sectors, clipping, transforms, or styling that hides or
 * ghosts objects). Changes that are only drawn but never picked, such as colors or custom objects, should not set it.
 * The camera and canvas size do not need to be set, as the pick caches compare them on every pick.
 */
export class PickCacheInvalidator {
  private _requested = false;

  request(): void {
    this._requested = true;
  }

  /**
   * Returns whether an invalidation was requested since the last call, and clears the flag.
   */
  consume(): boolean {
    const requested = this._requested;
    this._requested = false;
    return requested;
  }
}
