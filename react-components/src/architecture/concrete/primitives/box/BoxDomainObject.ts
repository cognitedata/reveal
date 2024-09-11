/*!
 * Copyright 2024 Cognite AS
 */

import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';
import { type ThreeView } from '../../../base/views/ThreeView';
import { BoxView } from './BoxView';
import { type Box3, Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { PrimitiveType } from '../PrimitiveType';
import { type BoxPickInfo } from '../../../base/utilities/box/BoxPickInfo';
import { type BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import { BoxDragger } from './BoxDragger';
import { type CreateDraggerProps } from '../../../base/domainObjects/VisualDomainObject';
import { getIconByPrimitiveType } from '../../measurements/getIconByPrimitiveType';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { PanelInfo } from '../../../base/domainObjectsHelpers/PanelInfo';
import { radToDeg } from 'three/src/math/MathUtils.js';
import {
  forceAroundPi,
  forceBetween0AndPi,
  forceBetween0AndTwoPi
} from '../../../base/utilities/extensions/mathExtensions';
import { MIN_SIZE, SolidDomainObject } from '../base/SolidDomainObject';
import { SolidPrimitiveRenderStyle } from '../base/SolidPrimitiveRenderStyle';
import { BoxUtils } from '../../../base/utilities/box/BoxUtils';

export abstract class BoxDomainObject extends SolidDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly size = new Vector3().setScalar(MIN_SIZE);
  public readonly center = new Vector3();
  public readonly rotation = new Euler(0, 0, 0, 'ZYX');
  private readonly _primitiveType: PrimitiveType;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  protected constructor(primitiveType: PrimitiveType = PrimitiveType.Box) {
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
      case PrimitiveType.HorizontalArea:
        return { key: 'MEASUREMENTS_HORIZONTAL_AREA', fallback: 'Horizontal area' };
      case PrimitiveType.VerticalArea:
        return { key: 'MEASUREMENTS_VERTICAL_AREA', fallback: 'Vertical area' };
      case PrimitiveType.Box:
        return { key: 'MEASUREMENTS_VOLUME', fallback: 'Volume' };
      default:
        throw new Error('Unknown PrimitiveType');
    }
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
    return new BoxDragger(props, this);
  }

  public override get hasPanelInfo(): boolean {
    return true;
  }

  public override getPanelInfo(): PanelInfo | undefined {
    const info = new PanelInfo();
    info.setHeader(this.typeName);

    const { primitiveType } = this;
    const isFinished = this.focusType !== FocusType.Pending;

    const hasX = BoxDomainObject.isValidSize(this.size.x);
    const hasY = BoxDomainObject.isValidSize(this.size.y);
    const hasZ = BoxDomainObject.isValidSize(this.size.z);

    if (isFinished || hasX) {
      add('MEASUREMENTS_LENGTH', 'Length', this.size.x, Quantity.Length);
    }
    if (primitiveType !== PrimitiveType.VerticalArea && (isFinished || hasY)) {
      add('MEASUREMENTS_DEPTH', 'Depth', this.size.y, Quantity.Length);
    }
    if (primitiveType !== PrimitiveType.HorizontalArea && (isFinished || hasZ)) {
      add('MEASUREMENTS_HEIGHT', 'Height', this.size.z, Quantity.Length);
    }
    if (primitiveType !== PrimitiveType.Box && (isFinished || this.hasArea)) {
      add('MEASUREMENTS_AREA', 'Area', this.area, Quantity.Area);
    }
    if (primitiveType === PrimitiveType.Box && (isFinished || this.hasHorizontalArea)) {
      add('MEASUREMENTS_HORIZONTAL_AREA', 'Horizontal area', this.horizontalArea, Quantity.Area);
    }
    if (primitiveType === PrimitiveType.Box && (isFinished || this.hasVolume)) {
      add('MEASUREMENTS_VOLUME', 'Volume', this.volume, Quantity.Volume);
    }
    // I forgot to add text for rotation angle before the deadline, so I used a icon instead.
    if (this.rotation.z !== 0 && isFinished) {
      info.add({
        key: undefined,
        fallback: '',
        icon: 'Angle',
        value: this.zRotationInDegrees,
        quantity: Quantity.Angle
      });
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

  public override copyFrom(domainObject: BoxDomainObject, what?: symbol): void {
    super.copyFrom(domainObject, what);
    if (what === undefined || what === Changes.geometry) {
      this.size.copy(domainObject.size);
      this.center.copy(domainObject.center);
      this.rotation.copy(domainObject.rotation);
    }
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new BoxView();
  }

  // ==================================================
  // OVERRIDES of SolidDomainObject
  // ==================================================

  public override get primitiveType(): PrimitiveType {
    return this._primitiveType;
  }

  public override canRotateComponent(component: number): boolean {
    return component === 2;
  }

  public override getBoundingBox(): Box3 {
    return BoxUtils.getBoundingBox(this.getMatrix());
  }

  public override getRotationMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    matrix.identity();
    matrix.makeRotationFromEuler(this.rotation);
    return matrix;
  }

  public override getScaledMatrix(scale: Vector3, matrix: Matrix4 = new Matrix4()): Matrix4 {
    matrix.identity();
    matrix.makeRotationFromEuler(this.rotation);
    matrix.setPosition(this.center);
    matrix.scale(scale);
    return matrix;
  }

  public override getMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    return this.getScaledMatrix(this.size, matrix);
  }

  public override setMatrix(matrix: Matrix4): void {
    const quaternion = new Quaternion();
    matrix.decompose(this.center, quaternion, this.size);
    this.rotation.setFromQuaternion(quaternion, 'ZYX');
  }

  public override clear(): void {
    super.clear();
    this.size.setScalar(MIN_SIZE);
    this.center.setScalar(0);
    this.rotation.set(0, 0, 0, 'ZYX');
  }

  // ==================================================
  // INSTANCE METHODS / PROPERTIES: Geometrical getters
  // ==================================================

  public get hasXYRotation(): boolean {
    return this.rotation.x !== 0 || this.rotation.y !== 0;
  }

  public get zRotationInDegrees(): number {
    const zRotation = this.hasXYRotation
      ? forceBetween0AndTwoPi(this.rotation.z)
      : forceBetween0AndPi(this.rotation.z);
    return radToDeg(zRotation);
  }

  public getRotationInDegrees(component: number): number {
    if (component === 0) {
      return radToDeg(forceAroundPi(this.rotation.x));
    }
    if (component === 1) {
      return radToDeg(forceAroundPi(this.rotation.y));
    }
    return this.zRotationInDegrees;
  }

  public get diagonal(): number {
    return this.size.length();
  }

  public get hasArea(): boolean {
    let count = 0;
    if (BoxDomainObject.isValidSize(this.size.x)) count++;
    if (BoxDomainObject.isValidSize(this.size.y)) count++;
    if (BoxDomainObject.isValidSize(this.size.z)) count++;
    return count >= 2;
  }

  public get area(): number {
    switch (this.primitiveType) {
      case PrimitiveType.HorizontalArea:
        return this.size.x * this.size.y;
      case PrimitiveType.VerticalArea:
        return this.size.x * this.size.z;
      case PrimitiveType.Box: {
        const a = this.size.x * this.size.y + this.size.y * this.size.z + this.size.z * this.size.x;
        return a * 2;
      }
      default:
        throw new Error('Unknown MeasureType type');
    }
  }

  public get hasHorizontalArea(): boolean {
    return BoxDomainObject.isValidSize(this.size.x) && BoxDomainObject.isValidSize(this.size.y);
  }

  public get horizontalArea(): number {
    return this.size.x * this.size.y;
  }

  public get hasVolume(): boolean {
    return (
      BoxDomainObject.isValidSize(this.size.x) &&
      BoxDomainObject.isValidSize(this.size.y) &&
      BoxDomainObject.isValidSize(this.size.z)
    );
  }

  public get volume(): number {
    return this.size.x * this.size.y * this.size.z;
  }

  // ==================================================
  // INSTANCE METHODS: Others
  // ==================================================

  public forceMinSize(): void {
    const { size } = this;
    size.x = Math.max(MIN_SIZE, size.x);
    size.y = Math.max(MIN_SIZE, size.y);
    size.z = Math.max(MIN_SIZE, size.z);
  }
}
