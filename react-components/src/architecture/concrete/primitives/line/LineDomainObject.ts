/*!
 * Copyright 2024 Cognite AS
 */

import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';
import { type Box3, type Vector3 } from 'three';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { LineRenderStyle } from './LineRenderStyle';
import {
  horizontalDistanceTo,
  verticalDistanceTo
} from '../../../base/utilities/extensions/vectorExtensions';
import { PanelInfo } from '../../../base/domainObjectsHelpers/PanelInfo';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { VisualDomainObject } from '../../../base/domainObjects/VisualDomainObject';
import { getIconByPrimitiveType } from '../../../base/utilities/primitives/getIconByPrimitiveType';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { clear } from '../../../base/utilities/extensions/arrayExtensions';
import { type IconName } from '../../../base/utilities/IconName';
import { Vector3ArrayUtils } from '../../../base/utilities/primitives/PointsUtils';

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

  public override get typeName(): TranslationInput {
    switch (this.primitiveType) {
      case PrimitiveType.Line:
        return { key: 'LINE' };
      case PrimitiveType.Polyline:
        return { key: 'POLYLINE' };
      case PrimitiveType.Polygon:
        return { key: 'POLYGON' };
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
    switch (this.primitiveType) {
      case PrimitiveType.Line:
        add({ key: 'LENGTH' }, this.getTotalLength());
        add({ key: 'HORIZONTAL_LENGTH' }, this.getHorizontalLength());
        add({ key: 'VERTICAL_LENGTH' }, this.getVerticalLength());
        break;

      case PrimitiveType.Polyline:
        add({ key: 'TOTAL_LENGTH' }, this.getTotalLength());
        add({ key: 'HORIZONTAL_LENGTH' }, this.getHorizontalLength());
        break;
      case PrimitiveType.Polygon:
        add({ key: 'TOTAL_LENGTH' }, this.getTotalLength());
        add({ key: 'HORIZONTAL_LENGTH' }, this.getHorizontalLength());
        if (this.isClosed) {
          add({ key: 'HORIZONTAL_AREA' }, this.getHorizontalArea(), Quantity.Area);
        }
        break;

      default:
        throw new Error('Unknown PrimitiveType type');
    }
    return info;

    function add(
      translationInput: TranslationInput,
      value: number,
      quantity = Quantity.Length
    ): void {
      info.add({ translationInput, value, quantity });
    }
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
  // VIRTUAL METHODS: To be overridden
  // ==================================================

  public getTransformedPoint(point: Vector3): Vector3 {
    return point;
  }

  public getCopyOfTransformedPoint(point: Vector3, target: Vector3): Vector3 {
    target.copy(point);
    return target;
  }

  public getTriangleIndexes(): number[] | undefined {
    return undefined;
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
    const transformedPoints = this.points.map((point) => this.getTransformedPoint(point));
    return Math.abs(Vector3ArrayUtils.getSignedHorizontalArea(transformedPoints));
  }

  public expandBoundingBox(boundingBox: Box3): void {
    for (const point of this.points) {
      const transformedPoint = this.getTransformedPoint(point);
      boundingBox.expandByPoint(transformedPoint);
    }
  }
}
