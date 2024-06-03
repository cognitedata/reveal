/*!
 * Copyright 2024 Cognite AS
 */

import { type RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';
import { type ThreeView } from '../../base/views/ThreeView';
import { MeasureLineView } from './MeasureLineView';
import { Color, Vector3 } from 'three';
import { MeasureType } from './MeasureType';
import { MeasureLineRenderStyle } from './MeasureLineRenderStyle';
import { MeasureDomainObject } from './MeasureDomainObject';
import {
  getHorizontalCrossProduct,
  horizontalDistanceTo,
  verticalDistanceTo
} from '../../base/utilities/extensions/vectorExtensions';
import { NumberType, PanelInfo } from '../../base/domainObjectsHelpers/PanelInfo';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { FocusType } from '../../base/domainObjectsHelpers/FocusType';

export class MeasureLineDomainObject extends MeasureDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly points: Vector3[] = [];
  public focusType = FocusType.None;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public override get renderStyle(): MeasureLineRenderStyle {
    return this.getRenderStyle() as MeasureLineRenderStyle;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(measureType: MeasureType) {
    super(measureType);
    this.color = new Color(Color.NAMES.red);
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override createRenderStyle(): RenderStyle | undefined {
    return new MeasureLineRenderStyle();
  }

  public override getPanelInfo(): PanelInfo | undefined {
    if (this.focusType === FocusType.Pending && this.points.length <= 1) {
      return undefined;
    }
    const info = new PanelInfo();
    switch (this.measureType) {
      case MeasureType.Line:
        info.setHeader('MEASUREMENTS_LINE', 'Line');
        add('MEASUREMENTS_LENGTH', 'Length', this.getTotalLength());
        add('MEASUREMENTS_HORIZONTAL_LENGTH', 'Horizontal length', this.getHorizontalLength());
        add('MEASUREMENTS_VERTICAL_LENGTH', 'Vertical length', this.getVerticalLength());
        break;

      case MeasureType.Polyline:
        info.setHeader('MEASUREMENTS_POLYLINE', 'Polyline');
        add('MEASUREMENTS_TOTAL_LENGTH', 'Total length', this.getTotalLength());
        break;
      case MeasureType.Polygon:
        info.setHeader('MEASUREMENTS_POLYGON', 'Polygon');
        add('MEASUREMENTS_TOTAL_LENGTH', 'Total length', this.getTotalLength());
        if (this.points.length > 2) {
          add(
            'MEASUREMENTS_HORIZONTAL_AREA',
            'Horizontal area',
            this.getHorizontalArea(),
            NumberType.Area
          );
        }
        break;

      default:
        throw new Error('Unknown MeasureType type');
    }
    return info;

    function add(
      key: string,
      fallback: string,
      value: number,
      numberType = NumberType.Length
    ): void {
      info.add({ key, fallback, value, numberType });
    }
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new MeasureLineView();
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getTotalLength(): number {
    let prevPoint: Vector3 | undefined;
    let sum = 0.0;
    for (const point of this.points) {
      if (prevPoint !== undefined) {
        sum += point.distanceTo(prevPoint);
      }
      prevPoint = point;
    }
    return sum;
  }

  public getAverageLength(): number {
    const count = this.points.length;
    if (count <= 1) {
      return 0;
    }
    return this.getTotalLength() / (count - 1);
  }

  public getHorizontalLength(): number {
    let prevPoint: Vector3 | undefined;
    let sum = 0.0;
    for (const point of this.points) {
      if (prevPoint !== undefined) {
        sum += horizontalDistanceTo(point, prevPoint);
        continue;
      }
      prevPoint = point;
    }
    return sum;
  }

  public getVerticalLength(): number {
    let prevPoint: Vector3 | undefined;
    let sum = 0.0;
    for (const point of this.points) {
      if (prevPoint !== undefined) {
        sum += verticalDistanceTo(point, prevPoint);
        continue;
      }
      prevPoint = point;
    }
    return sum;
  }

  public getHorizontalArea(): number {
    const { points } = this;
    const count = points.length;
    if (count <= 2) {
      return 0;
    }
    let sum = 0.0;
    const first = points[0];
    const p0 = new Vector3();
    const p1 = new Vector3();

    for (let index = 1; index <= count; index++) {
      p1.copy(points[index % count]);
      p1.sub(first); // Translate down to first point, to increase acceracy
      sum += getHorizontalCrossProduct(p0, p1);
      p0.copy(p1);
    }
    return Math.abs(sum) / 2;
  }

  public setFocusInteractive(focusType: FocusType): boolean {
    if (this.focusType === focusType) {
      return false;
    }
    this.focusType = focusType;
    this.notify(Changes.focus);
    return true;
  }
}
