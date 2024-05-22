/*!
 * Copyright 2024 Cognite AS
 */

import { MeasureBoxRenderStyle } from './MeasureBoxRenderStyle';
import { type RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';
import { type ThreeView } from '../../base/views/ThreeView';
import { MeasureBoxView } from './MeasureBoxView';
import { Matrix4, Vector3 } from 'three';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { BoxFace } from '../../base/utilities/box/BoxFace';
import { BoxFocusType } from '../../base/utilities/box/BoxFocusType';
import { MeasureType } from './MeasureType';
import { type DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { type BoxPickInfo } from '../../base/utilities/box/BoxPickInfo';
import { type BaseDragger } from '../../base/domainObjectsHelpers/BaseDragger';
import { MeasureBoxDragger } from './MeasureBoxDragger';
import { MeasureDomainObject } from './MeasureDomainObject';

export const MIN_BOX_SIZE = 0.01;

export class MeasureBoxDomainObject extends MeasureDomainObject {
  // ==================================================
  // INSTANCE FIELDS (This implements the IBox interface)
  // ==================================================

  public readonly size = new Vector3().setScalar(MIN_BOX_SIZE);
  public readonly center = new Vector3();
  public zRotation = 0; // Angle in radians in interval [0, 2*Pi>

  // For focus when edit in 3D (Used when isSelected is true only)
  public focusFace: BoxFace | undefined = undefined;
  public focusType: BoxFocusType = BoxFocusType.JustCreated;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get diagonal(): number {
    return this.size.length();
  }

  public get area(): number {
    return 2 * (this.size.x + this.size.y + this.size.z);
  }

  public get hasArea(): boolean {
    let count = 0;
    if (this.size.x > MIN_BOX_SIZE) count++;
    if (this.size.y > MIN_BOX_SIZE) count++;
    if (this.size.z > MIN_BOX_SIZE) count++;
    return count >= 2;
  }

  public get volume(): number {
    return this.size.x * this.size.y * this.size.z;
  }

  public override get renderStyle(): MeasureBoxRenderStyle {
    return this.getRenderStyle() as MeasureBoxRenderStyle;
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
      case MeasureType.HorizontalArea:
        return 'Measure horizontal area';
      case MeasureType.VerticalArea:
        return 'Measure vertical area';
      case MeasureType.Volume:
        return 'Measure volume';
      default:
        throw new Error('Unknown MeasureType type');
    }
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new MeasureBoxRenderStyle();
  }

  public override createDragger(intersection: DomainObjectIntersection): BaseDragger | undefined {
    const pickInfo = intersection.userData as BoxPickInfo;
    if (pickInfo === undefined) {
      return undefined;
    }
    return new MeasureBoxDragger(this, intersection.point, pickInfo);
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new MeasureBoxView();
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public forceMinSize(): void {
    const { size } = this;
    size.x = Math.max(MIN_BOX_SIZE, size.x);
    size.y = Math.max(MIN_BOX_SIZE, size.y);
    size.z = Math.max(MIN_BOX_SIZE, size.z);
  }

  public getRotationMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    matrix.makeRotationZ(this.zRotation);
    return matrix;
  }

  public getMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    return this.getScaledMatrix(this.size, matrix);
  }

  public getScaledMatrix(scale: Vector3, matrix: Matrix4 = new Matrix4()): Matrix4 {
    matrix = this.getRotationMatrix(matrix);
    matrix.setPosition(this.center);
    matrix.scale(scale);
    return matrix;
  }

  public setFocusInteractive(focusType: BoxFocusType, focusFace?: BoxFace): boolean {
    if (focusType === this.focusType && BoxFace.equals(this.focusFace, focusFace)) {
      return false; // No change
    }
    this.focusType = focusType;
    this.focusFace = focusFace;
    this.notify(Changes.focus);
    return true;
  }
}
