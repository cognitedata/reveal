/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObjectChange } from './DomainObjectChange';
import { isInstanceOf, type Class } from './Class';
import { clear, remove } from '../utilities/extensions/arrayExtensions';
import { type BaseView } from '../views/BaseView';
import { type DomainObject } from '../domainObjects/DomainObject';

type NotifyDelegate = (domainObject: DomainObject, change: DomainObjectChange) => void;

/**
 * Represents the subject in the Observer pattern
 * A subject is an abstract class that provides functionality for notifying views and
 * listeners about changes.
 */
export class Views {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public _notifyParentListeners: boolean = false;
  private readonly _views: BaseView[] = [];
  private readonly _listeners: NotifyDelegate[] = [];

  // eslint-disable-next-line accessor-pairs
  public set notifyParentListeners(value: boolean) {
    this._notifyParentListeners = value;
  }

  // ==================================================
  // VIRTUAL METHODS:
  // ==================================================

  /**
   * Notifies the listeners and views about a change in the domain object.
   * The should be called from DomainObject class only
   * @param domainObject - The domain object that has changed.
   * @param change - The change that occurred in the domain object.
   */
  public notify(domainObject: DomainObject, change: DomainObjectChange): void {
    for (const listener of this._listeners) {
      listener(domainObject, change);
    }
    if (this._notifyParentListeners && domainObject.parent !== undefined) {
      for (const listener of domainObject.parent.views._listeners) {
        listener(domainObject, change);
      }
    }
    for (const view of this._views) {
      view.update(change);
    }
  }

  // ==================================================
  // INSTANCE METHODS: Views admin
  // ==================================================

  public *getByType<T extends BaseView>(classType: Class<T>): Generator<T> {
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

  private removeAllViews(): void {
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

  private removeEventListeners(): void {
    clear(this._listeners);
  }

  public clear(): void {
    this.removeEventListeners();
    this.removeAllViews();
  }
}
