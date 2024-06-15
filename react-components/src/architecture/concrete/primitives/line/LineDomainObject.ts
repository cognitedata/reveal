/*!
 * Copyright 2024 Cognite AS
 */

import { type RenderStyle } from '../../../base/domainObjectsHelpers/RenderStyle';
import { type ThreeView } from '../../../base/views/ThreeView';
import { LineView } from './LineView';
import { Vector3 } from 'three';
import { PrimitiveType } from '../PrimitiveType';
import { LineRenderStyle } from './LineRenderStyle';
import {
  getHorizontalCrossProduct,
  horizontalDistanceTo,
  verticalDistanceTo
} from '../../../base/utilities/extensions/vectorExtensions';
import { PanelInfo } from '../../../base/domainObjectsHelpers/PanelInfo';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { VisualDomainObject } from '../../../base/domainObjects/VisualDomainObject';
import { getIconByPrimitiveType } from '../../measurements/getIconByPrimitiveType';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';

export abstract class LineDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly points: Vector3[] = [];
  private readonly _primitiveType: PrimitiveType;
  public focusType = FocusType.None;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get renderStyle(): LineRenderStyle {
    return this.getRenderStyle() as LineRenderStyle;
  }

  public get primitiveType(): PrimitiveType {
    return this._primitiveType;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  protected constructor(primitiveType: PrimitiveType) {
    super();
    this._primitiveType = primitiveType;
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get icon(): string {
    return getIconByPrimitiveType(this.primitiveType);
  }

  public override get typeName(): TranslateKey {
    switch (this.primitiveType) {
      case PrimitiveType.Line:
        return { key: 'MEASUREMENTS_LINE', fallback: 'Line' };
      case PrimitiveType.Polyline:
        return { key: 'MEASUREMENTS_POLYLINE', fallback: 'Polyline' };
      case PrimitiveType.Polygon:
        return { key: 'MEASUREMENTS_POLYGON', fallback: 'Polygon' };
      default:
        throw new Error('Unknown PrimitiveType');
    }
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new LineRenderStyle();
  }

  public override get hasPanelInfo(): boolean {
    return true;
  }

  public override getPanelInfo(): PanelInfo | undefined {
    if (this.focusType === FocusType.Pending && this.points.length <= 1) {
      return undefined;
    }
    const info = new PanelInfo();
    info.setTypeName(this.typeName);

    switch (this.primitiveType) {
      case PrimitiveType.Line:
        add('MEASUREMENTS_LENGTH', 'Length', this.getTotalLength());
        add('MEASUREMENTS_HORIZONTAL_LENGTH', 'Horizontal length', this.getHorizontalLength());
        add('MEASUREMENTS_VERTICAL_LENGTH', 'Vertical length', this.getVerticalLength());
        break;

      case PrimitiveType.Polyline:
        add('MEASUREMENTS_TOTAL_LENGTH', 'Total length', this.getTotalLength());
        break;
      case PrimitiveType.Polygon:
        add('MEASUREMENTS_TOTAL_LENGTH', 'Total length', this.getTotalLength());
        if (this.points.length > 2) {
          add(
            'MEASUREMENTS_HORIZONTAL_AREA',
            'Horizontal area',
            this.getHorizontalArea(),
            Quantity.Area
          );
        }
        break;

      default:
        throw new Error('Unknown PrimitiveType type');
    }
    return info;

    function add(key: string, fallback: string, value: number, quantity = Quantity.Length): void {
      info.add({ key, fallback, value, quantity });
    }
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new LineView();
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
      p1.sub(first); // Translate down to first point, to increase accuracy
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
