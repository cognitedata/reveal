/*!
 * Copyright 2024 Cognite AS
 */

import { signal } from '@cognite/signals';
import { type DomainObject } from '../domainObjects/DomainObject';
import { Changes } from '../domainObjectsHelpers/Changes';
import { type DomainObjectChange } from '../domainObjectsHelpers/DomainObjectChange';
export class DomainObjectPanelUpdater {
  // ==================================================
  // STATIC FIELDS
  // ==================================================

  public static readonly domainObject = signal<DomainObject | undefined>();
  public static readonly update = signal(0); // This increment by one when something happens with the domain object

  // ==================================================
  // STATIC METHODS
  // ==================================================

  public static show(domainObject: DomainObject | undefined): void {
    if (domainObject !== undefined) {
      if (!domainObject.hasPanelInfo) {
        return;
      }
      this.domainObject(domainObject);
    } else {
      this.hide();
    }
  }

  public static hide(): void {
    this.domainObject(undefined);
  }

  public static notify(domainObject: DomainObject, change: DomainObjectChange): void {
    if (!domainObject.hasPanelInfo) {
      return;
    }
    if (domainObject.isSelected) {
      if (change.isChanged(Changes.deleted)) {
        this.hide();
        return;
      }
      if (change.isChanged(Changes.selected)) {
        this.show(domainObject);
      }
      if (
        change.isChanged(
          Changes.selected,
          Changes.geometry,
          Changes.dragging,
          Changes.naming,
          Changes.unit
        )
      ) {
        this.update(this.update() + 1); // Force update
      }
    } else {
      if (change.isChanged(Changes.selected)) {
        this.hide(); // Deselected
      }
    }
  }
}
