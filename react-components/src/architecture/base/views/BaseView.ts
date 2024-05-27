/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObject } from '../domainObjects/DomainObject';
import { type DomainObjectChange } from '../domainObjectsHelpers/DomainObjectChange';

/**
 * Represents the observer in the Observer pattern
 * It provides common functionality for all types of views.
 */
export abstract class BaseView {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _domainObject: DomainObject | undefined = undefined;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected get hasDomainObject(): boolean {
    return this._domainObject !== undefined;
  }

  public get domainObject(): DomainObject {
    if (this._domainObject === undefined) {
      throw Error('The DomainObject is missing in the view');
    }
    return this._domainObject;
  }

  protected set domainObject(value: DomainObject) {
    this._domainObject = value;
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  /**
   * Initializes the view.
   * Override this function to initialize your view.
   * @remarks
   * Always call `super.initialize()` in the overrides.
   */
  public initialize(): void {}

  /**
   * Updates the view with the given change.
   * Override this function to update your view.
   *
   * @param change - The domain object change to apply to the view.
   * @remarks
   * Always call `super.update()` in the overrides.
   */
  public update(_change: DomainObjectChange): void {}

  /**
   * Clears the memory and removes redundant data.
   * This method should be overridden in derived classes.
   * @remarks
   * Always call `super.clearMemory()` in the overrides.
   */
  public clearMemory(): void {}

  /**
   * Called when the view is set to be visible.
   * Override this function to perform any necessary actions when the view becomes visible.
   * @remarks
   * Always call `super.onShow()` in the overrides.
   */
  public onShow(): void {}

  /**
   * Called when the view is set to NOT visible.
   * Override this function to perform any necessary actions when the view is hidden.
   * @remarks
   * Always call `super.onHide()` in the overrides.
   */
  public onHide(): void {}

  /**
   * Dispose the view.
   * Override this function to perform any necessary cleanup when the view is set to NOT visible.
   * This method is called just before the view is removed from the view list and detached.
   * @remarks
   * Always call `super.dispose()` in the overrides.
   */
  public dispose(): void {
    this._domainObject = undefined;
  }
}
