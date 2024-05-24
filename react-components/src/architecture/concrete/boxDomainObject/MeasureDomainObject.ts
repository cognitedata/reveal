/*!
 * Copyright 2024 Cognite AS
 */

import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { getIconByMeasureType, getNameByMeasureType, type MeasureType } from './MeasureType';
import { type MeasureRenderStyle } from './MeasureRenderStyle';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { DomainObjectPanelUpdater } from '../../base/reactUpdaters/DomainObjectPanelUpdater';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { PopupStyle } from '../../base/domainObjectsHelpers/PopupStyle';

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

  public override get icon(): string {
    return getIconByMeasureType(this.measureType);
  }

  public override get typeName(): string {
    return getNameByMeasureType(this.measureType);
  }

  public override getPanelInfoStyle(): PopupStyle {
    // bottom = 66 because the measurement toolbar is below
    return new PopupStyle({ bottom: 66, left: 0 });
  }

  protected override notifyCore(change: DomainObjectChange): void {
    super.notifyCore(change);

    if (!DomainObjectPanelUpdater.isActive) {
      return;
    }
    if (this.isSelected) {
      if (change.isChanged(Changes.deleted)) {
        DomainObjectPanelUpdater.update(undefined);
      }
      if (change.isChanged(Changes.selected, Changes.geometry)) {
        DomainObjectPanelUpdater.update(this);
      }
    } else {
      if (change.isChanged(Changes.selected)) {
        DomainObjectPanelUpdater.update(undefined); // Deselected
      }
    }
  }
}
