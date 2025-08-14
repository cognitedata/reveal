import { signal } from '@cognite/signals';
import { type DomainObject } from '../domainObjects/DomainObject';
import { Changes } from '../domainObjectsHelpers/Changes';
import { type DomainObjectChange } from '../domainObjectsHelpers/DomainObjectChange';
/**
 * Manages the state and updates for a domain object's panel in a React application.
 *
 * The `DomainObjectPanelUpdater` class is responsible for tracking the currently selected domain object,
 * handling visibility of the domain object panel, and notifying the UI of relevant changes to the domain object.
 * It uses signals to manage reactivity and trigger updates when the domain object changes.
 *
 * @remarks
 * - The panel is only shown for domain objects that have panel information (`hasPanelInfo`).
 * - The `update` signal is incremented to force UI updates when certain changes occur.
 *
 */
export class DomainObjectPanelUpdater {
  // ==================================================
  // STATIC FIELDS
  // ==================================================

  public readonly selectedDomainObject = signal<DomainObject | undefined>();
  public readonly domainObjectChanged = signal(0); // This increment by one when something happens with the domain object

  // ==================================================
  // STATIC METHODS
  // ==================================================

  public show(domainObject: DomainObject | undefined): void {
    if (domainObject !== undefined) {
      if (!domainObject.hasPanelInfo) {
        return;
      }
      this.selectedDomainObject(domainObject);
    } else {
      this.hide();
    }
  }

  public hide(): void {
    this.selectedDomainObject(undefined);
  }

  public notify(domainObject: DomainObject, change: DomainObjectChange): void {
    if (!domainObject.hasPanelInfo) {
      return;
    }
    if (domainObject.isSelected) {
      if (change.isChanged(Changes.deleting)) {
        this.hide();
        return;
      }
      if (change.isChanged(Changes.selected)) {
        this.show(domainObject);
      }
      if (change.isChanged(Changes.geometry, Changes.dragging, Changes.naming)) {
        this.domainObjectChanged(this.domainObjectChanged() + 1); // Force update
      }
    } else {
      if (change.isChanged(Changes.selected)) {
        this.hide(); // Deselected
      }
    }
  }
}
