/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObject } from '../domainObjects/DomainObject';

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

  public static update(domainObject: DomainObject | undefined): void {
    if (this._setDomainObject === undefined) {
      return;
    }
    if (domainObject === undefined) {
      this._setDomainObject(undefined);
      return;
    }
    const domainObjectInfo = { domainObject };
    this._setDomainObject(domainObjectInfo);
  }
}
