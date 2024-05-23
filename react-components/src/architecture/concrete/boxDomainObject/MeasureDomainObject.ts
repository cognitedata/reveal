/*!
 * Copyright 2024 Cognite AS
 */

import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type MeasureType } from './MeasureType';
import { type MeasureRenderStyle } from './MeasureRenderStyle';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { DomainObjectPanelUpdater } from '../../base/domainObjectsHelpers/DomainObjectPanelUpdater';
import { Changes } from '../../base/domainObjectsHelpers/Changes';

export abstract class MeasureDomainObject extends VisualDomainObject {
  private readonly _measureType: MeasureType;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get renderStyle(): MeasureRenderStyle {
    return this.getRenderStyle() as MeasureRenderStyle;
  }

  public get measureType(): MeasureType {
    return this._measureType;
  }

  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  public constructor(measureType: MeasureType) {
    super();
    this._measureType = measureType;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  protected override notifyCore(change: DomainObjectChange): void {
    super.notifyCore(change);

    if (!DomainObjectPanelUpdater.isActive) {
      return;
    }
    if (this.isSelected) {
      if (change.isChanged(Changes.deleted)) {
        DomainObjectPanelUpdater.update(undefined);
      }
      if (change.isChanged(Changes.selected, Changes.geometry, Changes.nameing)) {
        DomainObjectPanelUpdater.update(this);
      }
    } else {
      if (change.isChanged(Changes.selected)) {
        DomainObjectPanelUpdater.update(undefined); // Deselected
      }
    }
  }
}
