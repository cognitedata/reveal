/*!
 * Copyright 2024 Cognite AS
 */

import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type MeasureType } from './MeasureType';
import { type MeasureRenderStyle } from './MeasureRenderStyle';

export const MIN_BOX_SIZE = 0.01;

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
}
