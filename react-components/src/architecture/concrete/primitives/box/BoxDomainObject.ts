/*!
 * Copyright 2024 Cognite AS
 */

import { SolidPrimitiveRenderStyle } from '../SolidPrimitiveRenderStyle';
import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';
import { type ThreeView } from '../../../base/views/ThreeView';
import { BoxView } from './BoxView';
import { type Box3, Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { BoxFace } from '../../../base/utilities/box/BoxFace';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { PrimitiveType } from '../PrimitiveType';
import { type BoxPickInfo } from '../../../base/utilities/box/BoxPickInfo';
import { type BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import { BoxDragger } from './BoxDragger';
import {
  VisualDomainObject,
  type CreateDraggerProps
} from '../../../base/domainObjects/VisualDomainObject';
import { getIconByPrimitiveType } from '../../measurements/getIconByPrimitiveType';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { PanelInfo } from '../../../base/domainObjectsHelpers/PanelInfo';
import { radToDeg } from 'three/src/math/MathUtils.js';
import { DomainObjectTransaction } from '../../../base/undo/DomainObjectTransaction';
import { type Transaction } from '../../../base/undo/Transaction';
import {
  forceBetween0AndPi,
  forceBetween0AndTwoPi
} from '../../../base/utilities/extensions/mathExtensions';
import { getBoundingBoxForBox } from '../../../base/utilities/box/createBoxGeometry';

const MIN_SIZE = 0.01;

export abstract class BoxDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly size = new Vector3().setScalar(MIN_SIZE);
  public readonly center = new Vector3();
  public readonly rotation = new Euler(0, 0, 0, 'ZYX');
  private readonly _primitiveType: PrimitiveType;

  // For focus when edit in 3D (Used when isSelected is true only)
  public focusType: FocusType = FocusType.None;
  public focusFace: BoxFace | undefined = undefined;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get renderStyle(): SolidPrimitiveRenderStyle {
    return this.getRenderStyle() as SolidPrimitiveRenderStyle;
  }

  public get primitiveType(): PrimitiveType {
    return this._primitiveType;
  }

  public get hasXYRotation(): boolean {
    return this.rotation.x !== 0 || this.rotation.y !== 0;
  }

  public get zRotationInDegrees(): number {
    const zRotation = this.hasXYRotation
      ? forceBetween0AndTwoPi(this.rotation.z)
      : forceBetween0AndPi(this.rotation.z);
    return radToDeg(zRotation);
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  protected constructor(primitiveType: PrimitiveType = PrimitiveType.Box) {
    super();
    this._primitiveType = primitiveType;
  }

  public clear(): void {
    this.size.setScalar(MIN_SIZE);
    this.center.setScalar(0);
    this.rotation.set(0, 0, 0, 'ZYX');
    this.focusType = FocusType.None;
    this.focusFace = undefined;
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

  public override createTransaction(changed: symbol): Transaction {
    return new DomainObjectTransaction(this, changed);
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
  // VIRTUAL METHODS (To be overridden)
  // ==================================================

  public canRotateComponent(component: number): boolean {
    return component === 2;
  }

  // ==================================================
  // INSTANCE METHODS / PROPERTIES: Geometrical getters
  // ==================================================

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

  public getBoundingBox(): Box3 {
    return getBoundingBoxForBox(this.getMatrix());
  }

  // ==================================================
  // INSTANCE METHODS: Matrix getters
  // ==================================================

  public getRotationMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    matrix.identity();
    matrix.makeRotationFromEuler(this.rotation);
    return matrix;
  }

  public getMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    return this.getScaledMatrix(this.size, matrix);
  }

  public getScaledMatrix(scale: Vector3, matrix: Matrix4 = new Matrix4()): Matrix4 {
    matrix.identity();
    matrix.makeRotationFromEuler(this.rotation);
    matrix.setPosition(this.center);
    matrix.scale(scale);
    return matrix;
  }

  public setMatrix(matrix: Matrix4): void {
    const quaternion = new Quaternion();
    matrix.decompose(this.center, quaternion, this.size);
    this.rotation.setFromQuaternion(quaternion, 'ZYX');
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

  public setFocusInteractive(focusType: FocusType, focusFace?: BoxFace): boolean {
    const changeFromPending =
      this.focusType === FocusType.Pending && focusType !== FocusType.Pending;
    if (focusType === FocusType.None) {
      if (this.focusType === FocusType.None) {
        return false; // No change
      }
      this.focusType = FocusType.None;
      this.focusFace = undefined; // Ignore input face
    } else {
      if (focusType === this.focusType && BoxFace.equals(this.focusFace, focusFace)) {
        return false; // No change
      }
      this.focusType = focusType;
      this.focusFace = focusFace;
    }
    this.notify(Changes.focus);
    if (changeFromPending) {
      this.notify(Changes.geometry);
    }
    return true;
  }

  public static isValidSize(value: number): boolean {
    return value > MIN_SIZE;
  }
}
