/*!
 * Copyright 2024 Cognite AS
 */

import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';
import { type ThreeView } from '../../base/views/ThreeView';
import { MeasureLineView } from './MeasureLineView';
import { Color, type Vector3 } from 'three';
import { MeasureType } from './MeasureType';
import { MeasureLineRenderStyle } from './MeasureLineRenderStyle';

export class MeasureLineDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public isClosed: boolean = false;
  public points: Vector3[] = [];
  private readonly _measureType: MeasureType;

  public get length(): number {
    return this.points.length;
  }

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get renderStyle(): MeasureLineRenderStyle {
    return this.getRenderStyle() as MeasureLineRenderStyle;
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
    this.color = new Color(1, 0, 0);
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): string {
    switch (this._measureType) {
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
