/*!
 * Copyright 2024 Cognite AS
 */

import { DomainObjectChange } from '../domainObjectsHelpers/DomainObjectChange';
import { isInstanceOf, type Class } from '../domainObjectsHelpers/Class';
import { clear, remove } from '../utilities/extensions/arrayExtensions';
import { type BaseView } from '../views/BaseView';
import { type DomainObject } from './DomainObject';

type NotifyDelegate = (domainObject: DomainObject, change: DomainObjectChange) => void;

/**
 * Represents the subject in the Observer pattern
 * A subject is an abstract class that provides functionality for notifying views and
 * listeners about changes.
 */
export abstract class BaseSubject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _views: BaseView[] = [];
  private readonly _listeners: NotifyDelegate[] = [];

  // ==================================================
  // VIRTUAL METHODS:
  // ==================================================

  /**
   * Notifies the registered views and listeners about a change in the domain object.
   * This method should be overridden in derived classes to provide custom implementation.
   * @param change - The change object representing the update.
   * @remarks
   * Always call `super.notifyCore()` in the overrides.
   */
  protected notifyCore<T extends DomainObject & BaseSubject>(
    this: T,
    change: DomainObjectChange
  ): void {
    for (const listener of this._listeners) {
      listener(this, change);
    }
    for (const view of this._views) {
      view.update(change);
    }
  }

  // ==================================================
  // INSTANCE METHODS: Notifying
  // ==================================================

  public notify<T extends DomainObject & BaseSubject>(
    this: T,
    change: DomainObjectChange | symbol
  ): void {
    if (change instanceof DomainObjectChange) {
      this.notifyCore(change);
    } else {
      this.notify(new DomainObjectChange(change));
    }
  }

  // ==================================================
  // INSTANCE METHODS: Views admin
  // ==================================================

  public *getViewsByType<T extends BaseView>(classType: Class<T>): Generator<T> {
    for (const view of this._views) {
      if (isInstanceOf(view, classType)) {
        yield view;
      }
    }
  }

  public addView(view: BaseView): void {
    this._views.push(view);
  }

  public removeView(view: BaseView): void {
    view.onHide();
    view.dispose();
    remove(this._views, view);
  }

  protected removeAllViews(): void {
    for (const view of this._views) {
      view.onHide();
      view.dispose();
    }
    clear(this._views);
  }

  // ==================================================
  // INSTANCE METHODS: Event listeners admin
  // ==================================================

  public addEventListener(listener: NotifyDelegate): void {
    this._listeners.push(listener);
  }

  public removeEventListener(listener: NotifyDelegate): void {
    remove(this._listeners, listener);
  }

  protected removeEventListeners(): void {
    clear(this._listeners);
  }
}
