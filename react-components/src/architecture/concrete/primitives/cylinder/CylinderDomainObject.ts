/*!
 * Copyright 2024 Cognite AS
 */

import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';
import { type ThreeView } from '../../../base/views/ThreeView';
import { CylinderView } from './CylinderView';
import { type Box3, Matrix4, Quaternion, Vector3 } from 'three';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { PrimitiveType } from '../PrimitiveType';
import { type BoxPickInfo } from '../../../base/utilities/box/BoxPickInfo';
import { type BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import { CylinderDragger } from './CylinderDragger';
import { type CreateDraggerProps } from '../../../base/domainObjects/VisualDomainObject';
import { Range3 } from '../../../base/utilities/geometry/Range3';
import { getIconByPrimitiveType } from '../../measurements/getIconByPrimitiveType';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { PanelInfo } from '../../../base/domainObjectsHelpers/PanelInfo';
import { square } from '../../../base/utilities/extensions/mathExtensions';
import { MIN_SIZE, SolidDomainObject } from '../base/SolidDomainObject';
import { SolidPrimitiveRenderStyle } from '../base/SolidPrimitiveRenderStyle';

const UP_AXIS = new Vector3(0, 0, 1);

export abstract class CylinderDomainObject extends SolidDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public radius = MIN_SIZE;
  public readonly centerA = new Vector3(0, 0, -MIN_SIZE);
  public readonly centerB = new Vector3(0, 0, +MIN_SIZE);

  // Redundant variable, calculated when needed
  private readonly _center = new Vector3();
  private readonly _axis = new Vector3();

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get hasXYRotation(): boolean {
    return true;
  }

  public get zRotationInDegrees(): number {
    // const zRotation = this.hasXYRotation
    //   ? forceBetween0AndTwoPi(this.rotation.z)
    //   : forceBetween0AndPi(this.rotation.z);
    // return radToDeg(zRotation);
    return 0;
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get icon(): string {
    return getIconByPrimitiveType(this.primitiveType);
  }

  public override get typeName(): TranslateKey {
    return { key: 'MEASUREMENTS_CYLINDER', fallback: 'Cylinder' };
  }

  public override get isLegal(): boolean {
    return this.focusType !== FocusType.Pending;
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new SolidPrimitiveRenderStyle();
  }

  public override createDragger(props: CreateDraggerProps): BaseDragger | undefined {
    const pickInfo = props.intersection.userData as BoxPickInfo;
    if (pickInfo === undefined) {
      return undefined; // If the BoxPickInfo isn't specified, no dragger is created
    }
    return new CylinderDragger(props, this);
  }

  public override get hasPanelInfo(): boolean {
    return true;
  }

  public override getPanelInfo(): PanelInfo | undefined {
    const info = new PanelInfo();
    info.setHeader(this.typeName);

    const isFinished = this.focusType !== FocusType.Pending;
    const hasRadius = CylinderDomainObject.isValidSize(this.radius);
    const hasHeight = CylinderDomainObject.isValidSize(this.height);

    if (isFinished || hasRadius) {
      add('MEASUREMENTS_RADIUS', 'Radius', this.radius, Quantity.Length);
    }
    if (isFinished || hasHeight) {
      add('MEASUREMENTS_HEIGHT', 'Height', this.height, Quantity.Length);
    }
    if (isFinished || (hasRadius && hasHeight)) {
      add('MEASUREMENTS_AREA', 'Area', this.area, Quantity.Area);
      add('MEASUREMENTS_VOLUME', 'Volume', this.volume, Quantity.Volume);
    }
    return info;

    function add(
      key: string | undefined,
      fallback: string,
      value: number,
      quantity: Quantity
    ): void {
      info.add({ key, fallback, value, quantity });
    }
  }

  public override copyFrom(domainObject: CylinderDomainObject, what?: symbol): void {
    super.copyFrom(domainObject, what);
    if (what === undefined || what === Changes.geometry) {
      this.radius = domainObject.radius;
      this.centerA.copy(domainObject.centerA);
      this.centerB.copy(domainObject.centerB);
    }
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new CylinderView();
  }

  // ==================================================
  // OVERRIDES of SolidDomainObject
  // ==================================================

  public override get primitiveType(): PrimitiveType {
    return PrimitiveType.Cylinder;
  }

  public override canRotateComponent(component: number): boolean {
    return component === 2;
  }

  public override getBoundingBox(): Box3 {
    const range = new Range3(this.centerA, this.centerB);
    range.expandByMargin3(Range3.getCircleRangeMargin(this.axis, this.radius));
    return range.getBox();
  }

  public override clear(): void {
    super.clear();
    this.radius = MIN_SIZE;
    this.centerA.set(0, 0, -MIN_SIZE);
    this.centerB.set(0, 0, +MIN_SIZE);
  }

  public override getRotationMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    const quaternion = new Quaternion();
    quaternion.setFromUnitVectors(UP_AXIS, this.axis);
    matrix.makeRotationFromQuaternion(quaternion);
    return matrix;
  }

  public override getScaledMatrix(scale: Vector3, matrix: Matrix4 = new Matrix4()): Matrix4 {
    const quaternion = new Quaternion();
    quaternion.setFromUnitVectors(UP_AXIS, this.axis);
    matrix.compose(this.center, quaternion, scale);
    return matrix;
  }

  public override getMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    const scale = new Vector3(this.radius * 2, this.radius * 2, this.height);
    const quaternion = new Quaternion();
    quaternion.setFromUnitVectors(UP_AXIS, this.axis);
    matrix.compose(this.center, quaternion, scale);
    return matrix;
  }

  public setMatrix(matrix: Matrix4): void {
    const centerA = new Vector3(0, 0, -0.5).applyMatrix4(matrix);
    const centerB = new Vector3(0, 0, 0.5).applyMatrix4(matrix);
    const scale = new Vector3();
    matrix.decompose(new Vector3(), new Quaternion(), scale);

    this.centerA.copy(centerA);
    this.centerB.copy(centerB);
    this.radius = scale.x / 2;
  }

  // ==================================================
  // INSTANCE METHODS / PROPERTIES: Geometrical getters
  // ==================================================

  public get height(): number {
    return this.centerA.distanceTo(this.centerB);
  }

  public get diagonal(): number {
    return Math.sqrt(square(this.height) + square(2 * this.radius));
  }

  public get center(): Vector3 {
    return this._center.addVectors(this.centerB, this.centerA).divideScalar(2);
  }

  public get axis(): Vector3 {
    return this._axis.subVectors(this.centerB, this.centerA).normalize();
  }

  public get area(): number {
    return 2 * Math.PI * this.radius * this.height;
  }

  public get volume(): number {
    return Math.PI * square(this.radius) * this.height;
  }

  // ==================================================
  // INSTANCE METHODS: Others
  // ==================================================

  public forceMinSize(): void {
    this.radius = Math.max(this.radius, MIN_SIZE);
  }
}
