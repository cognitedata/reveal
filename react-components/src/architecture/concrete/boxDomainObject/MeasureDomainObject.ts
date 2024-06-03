/*!
 * Copyright 2024 Cognite AS
 */

import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { getIconByMeasureType, getNameByMeasureType, type MeasureType } from './MeasureType';
import { type MeasureRenderStyle } from './MeasureRenderStyle';
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
  // CONSTRUCTOR
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

  public override get hasPanelInfo(): boolean {
    return true;
  }

  public override getPanelInfoStyle(): PopupStyle {
    // bottom = 66 because the toolbar is below
    return new PopupStyle({ bottom: 66, left: 0 });
  }
}
