/*!
 * Copyright 2024 Cognite AS
 */

import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';
import { type ThreeView } from '../../../base/views/ThreeView';
import { LineView } from './LineView';
import { type Box3, Vector3 } from 'three';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
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
import { getIconByPrimitiveType } from '../../../base/utilities/primitives/getIconByPrimitiveType';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { clear } from '../../../base/utilities/extensions/arrayExtensions';
import { type Transaction } from '../../../base/undo/Transaction';
import { DomainObjectTransaction } from '../../../base/undo/DomainObjectTransaction';
import { type IconName } from '../../../base/utilities/IconName';

export abstract class LineDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly points: Vector3[] = [];
  private readonly _primitiveType: PrimitiveType;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get renderStyle(): LineRenderStyle {
    return this.getRenderStyle() as LineRenderStyle;
  }

  public get primitiveType(): PrimitiveType {
    return this._primitiveType;
  }

  public get pointCount(): number {
    return this.points.length;
  }

  public get lineSegmentCount(): number {
    return this.primitiveType === PrimitiveType.Polygon ? this.pointCount + 1 : this.pointCount;
  }

  public get firstPoint(): Vector3 {
    return this.points[0];
  }

  public get lastPoint(): Vector3 {
    return this.points[this.pointCount - 1];
  }

  public get isClosed(): boolean {
    return this.primitiveType === PrimitiveType.Polygon && this.pointCount >= 3;
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

  public override get icon(): IconName {
    return getIconByPrimitiveType(this.primitiveType);
  }

  public override get typeName(): TranslateKey {
    switch (this.primitiveType) {
      case PrimitiveType.Line:
        return { key: 'LINE', fallback: 'Line' };
      case PrimitiveType.Polyline:
        return { key: 'POLYLINE', fallback: 'Polyline' };
      case PrimitiveType.Polygon:
        return { key: 'POLYGON', fallback: 'Polygon' };
      default:
        throw new Error('Unknown PrimitiveType');
    }
  }

  public override get isLegal(): boolean {
    if (super.isLegal) {
      return true;
    }
    switch (this.primitiveType) {
      case PrimitiveType.Line:
        return this.pointCount === 2;
      case PrimitiveType.Polyline:
        return this.pointCount >= 2;
      case PrimitiveType.Polygon:
        return this.pointCount >= 3;
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
    if (this.focusType === FocusType.Pending && this.pointCount <= 1) {
      return undefined;
    }
    const info = new PanelInfo();
    info.setHeader(this.typeName);

    switch (this.primitiveType) {
      case PrimitiveType.Line:
        add('LENGTH', 'Length', this.getTotalLength());
        add('HORIZONTAL_LENGTH', 'Horizontal length', this.getHorizontalLength());
        add('VERTICAL_LENGTH', 'Vertical length', this.getVerticalLength());
        break;

      case PrimitiveType.Polyline:
        add('TOTAL_LENGTH', 'Total length', this.getTotalLength());
        add('HORIZONTAL_LENGTH', 'Horizontal length', this.getHorizontalLength());
        break;
      case PrimitiveType.Polygon:
        add('TOTAL_LENGTH', 'Total length', this.getTotalLength());
        add('HORIZONTAL_LENGTH', 'Horizontal length', this.getHorizontalLength());
        if (this.isClosed) {
          add('HORIZONTAL_AREA', 'Horizontal area', this.getHorizontalArea(), Quantity.Area);
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

  public override createTransaction(changed: symbol): Transaction {
    return new DomainObjectTransaction(this, changed);
  }

  public override copyFrom(domainObject: LineDomainObject, what?: symbol): void {
    super.copyFrom(domainObject, what);
    if (what === undefined || what === Changes.geometry) {
      clear(this.points);
      for (const point of domainObject.points) {
        this.points.push(point.clone());
      }
    }
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new LineView();
  }

  // ==================================================
  // VIRTUAL METHODS: To be overridden
  // ==================================================

  public getTransformedPoint(point: Vector3): Vector3 {
    return point;
  }

  public getCopyOfTransformedPoint(point: Vector3, target: Vector3): Vector3 {
    target.copy(point);
    return target;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getTotalLength(): number {
    let prevPoint = this.isClosed ? this.getTransformedPoint(this.lastPoint) : undefined;
    let sum = 0.0;
    for (const point of this.points) {
      const transformedPoint = this.getTransformedPoint(point);
      if (prevPoint !== undefined) {
        sum += transformedPoint.distanceTo(prevPoint);
      }
      prevPoint = transformedPoint;
    }
    return sum;
  }

  public getAverageLength(): number {
    const { lineSegmentCount } = this;
    if (lineSegmentCount <= 1) {
      return 0;
    }
    return this.getTotalLength() / lineSegmentCount;
  }

  public getHorizontalLength(): number {
    let prevPoint = this.isClosed ? this.getTransformedPoint(this.lastPoint) : undefined;
    let sum = 0.0;
    for (const point of this.points) {
      const transformedPoint = this.getTransformedPoint(point);
      if (prevPoint !== undefined) {
        sum += horizontalDistanceTo(transformedPoint, prevPoint);
      }
      prevPoint = transformedPoint;
    }
    return sum;
  }

  public getVerticalLength(): number {
    let prevPoint = this.isClosed ? this.getTransformedPoint(this.lastPoint) : undefined;
    let sum = 0.0;
    for (const point of this.points) {
      const transformedPoint = this.getTransformedPoint(point);
      if (prevPoint !== undefined) {
        sum += verticalDistanceTo(transformedPoint, prevPoint);
      }
      prevPoint = transformedPoint;
    }
    return sum;
  }

  public getHorizontalArea(): number {
    if (!this.isClosed) {
      return 0;
    }
    const { points, pointCount } = this;
    let sum = 0.0;
    const firstPoint = this.getTransformedPoint(this.firstPoint);
    const p0 = new Vector3();
    const p1 = new Vector3();

    // This applies "Greens theorem" to calculate the area of a polygon
    for (let index = 1; index <= pointCount; index++) {
      this.getCopyOfTransformedPoint(points[index % pointCount], p1);
      p1.sub(firstPoint); // Translate down to first point, to increase accuracy
      sum += getHorizontalCrossProduct(p0, p1);
      p0.copy(p1);
    }
    return Math.abs(sum) / 2;
  }

  public expandBoundingBox(boundingBox: Box3): void {
    for (const point of this.points) {
      const transformedPoint = this.getTransformedPoint(point);
      boundingBox.expandByPoint(transformedPoint);
    }
  }
}
