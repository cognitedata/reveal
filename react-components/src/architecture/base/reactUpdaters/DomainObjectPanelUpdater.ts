/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObject } from '../domainObjects/DomainObject';
import { Changes } from '../domainObjectsHelpers/Changes';
import { type DomainObjectChange } from '../domainObjectsHelpers/DomainObjectChange';

export type DomainObjectInfo = { domainObject: DomainObject };
export type SetDomainObjectInfoDelegate = (domainObjectInfo?: DomainObjectInfo) => void;

export class DomainObjectPanelUpdater {
  // ==================================================
  // STATIC FIELDS
  // ==================================================

  private static _setDomainObject: SetDomainObjectInfoDelegate | undefined = undefined;

  // ==================================================
  // STATIC METHODS
  // ==================================================

  public static get isActive(): boolean {
    return this._setDomainObject !== undefined;
  }

  public static setDomainObjectDelegate(value: SetDomainObjectInfoDelegate | undefined): void {
    this._setDomainObject = value;
  }

  public static hide(): void {
    if (this._setDomainObject === undefined) {
      return;
    }
    this._setDomainObject(undefined);
  }

  public static notify(domainObject: DomainObject, change: DomainObjectChange): void {
    if (!this.isActive) {
      return;
    }
    if (domainObject.isSelected) {
      if (change.isChanged(Changes.deleted)) {
        this.hide();
      }
      if (change.isChanged(Changes.selected, Changes.geometry, Changes.naming)) {
        this.update(domainObject);
      }
    } else {
      if (change.isChanged(Changes.selected)) {
        this.hide(); // Deselected
      }
    }
  }

  private static update(domainObject: DomainObject): void {
    if (this._setDomainObject === undefined) {
      return;
    }
    const info = { domainObject };
    this._setDomainObject(info);
  }
}
