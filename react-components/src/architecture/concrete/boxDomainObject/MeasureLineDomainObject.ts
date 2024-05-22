/*!
 * Copyright 2024 Cognite AS
 */

import { type RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';
import { type ThreeView } from '../../base/views/ThreeView';
import { MeasureLineView } from './MeasureLineView';
import { type Vector3 } from 'three';
import { MeasureType } from './MeasureType';
import { MeasureLineRenderStyle } from './MeasureLineRenderStyle';
import { MeasureDomainObject } from './MeasureDomainObject';

export class MeasureLineDomainObject extends MeasureDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public isClosed: boolean = false;
  public points: Vector3[] = [];

  public get length(): number {
    return this.points.length;
  }

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public override get renderStyle(): MeasureLineRenderStyle {
    return this.getRenderStyle() as MeasureLineRenderStyle;
  }

  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  public constructor(measureType: MeasureType) {
    super(measureType);
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): string {
    switch (this.measureType) {
      case MeasureType.Line:
        return 'Measure line';
      case MeasureType.Polyline:
        return 'Measure polyline';
      case MeasureType.Polygon:
        return 'Measure polygon';
      default:
        throw new Error('Unknown MeasureType type');
    }
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new MeasureLineRenderStyle();
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new MeasureLineView();
  }
}
