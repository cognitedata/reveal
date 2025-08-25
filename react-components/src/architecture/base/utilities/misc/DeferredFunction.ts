import { debouncedComputed, effect, signal } from '@cognite/signals';

export class DeferredFunction {
  private readonly _trigger = signal(0);
  private readonly _debouncedTrigger = debouncedComputed(() => this._trigger(), 1);
  private readonly _disposeEffect: () => void;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(func: () => void) {
    this._disposeEffect = effect(() => {
      // Use _debouncedTrigger to trigger the function
      // This will ensure that the function is called only once per frame
      if (this._debouncedTrigger.value() > 0) {
        func();
      }
    });
  }

  /**
   * Triggers a deferred function by incrementing the internal trigger.
   * This method is typically used to signal that update should occur,
   * without performing the update immediately.
   */
  public trigger(): void {
    this._trigger(this._trigger() + 1);
  }

  public dispose(): void {
    this._debouncedTrigger.dispose();
    this._disposeEffect();
  }
}
