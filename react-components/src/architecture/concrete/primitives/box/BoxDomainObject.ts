/*!
 * Copyright 2024 Cognite AS
 */

import { BoxRenderStyle } from './BoxRenderStyle';
import { type RenderStyle } from '../../../base/domainObjectsHelpers/RenderStyle';
import { type ThreeView } from '../../../base/views/ThreeView';
import { BoxView } from './BoxView';
import { Box3, Matrix4, Vector3 } from 'three';
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
import { Range3 } from '../../../base/utilities/geometry/Range3';
import { getIconByPrimitiveType } from '../../measurements/getIconByPrimitiveType';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { PanelInfo } from '../../../base/domainObjectsHelpers/PanelInfo';
import { radToDeg } from 'three/src/math/MathUtils.js';

export const MIN_BOX_SIZE = 0.01;

export abstract class BoxDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly size = new Vector3().setScalar(MIN_BOX_SIZE);
  public readonly center = new Vector3();
  public zRotation = 0; // Angle in radians in interval [0, 2*Pi>

  // For focus when edit in 3D (Used when isSelected is true only)
  public focusType: FocusType = FocusType.None;
  public focusFace: BoxFace | undefined = undefined;
  private readonly _primitiveType: PrimitiveType;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get renderStyle(): BoxRenderStyle {
    return this.getRenderStyle() as BoxRenderStyle;
  }

  public get primitiveType(): PrimitiveType {
    return this._primitiveType;
  }

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

  public override createRenderStyle(): RenderStyle | undefined {
    return new BoxRenderStyle();
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
    if (this.zRotation !== 0 && isFinished) {
      info.add({
        key: '',
        fallback: '',
        icon: 'Angle',
        value: radToDeg(this.zRotation),
        quantity: Quantity.Angle
      });
    }
    return info;

    function add(key: string, fallback: string, value: number, quantity: Quantity): void {
      info.add({ key, fallback, value, quantity });
    }
  }
  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new BoxView();
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  public get useClippingInIntersection(): boolean {
    return true;
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
    const matrix = this.getMatrix();
    const boundingBox = new Box3().makeEmpty();
    const unitCube = Range3.createCube(0.5);
    const corner = new Vector3();
    for (let i = 0; i < 8; i++) {
      unitCube.getCornerPoint(i, corner);
      corner.applyMatrix4(matrix);
      boundingBox.expandByPoint(corner);
    }
    return boundingBox;
  }

  // ==================================================
  // INSTANCE METHODS: Matrix getters
  // ==================================================

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

  // ==================================================
  // INSTANCE METHODS: Others
  // ==================================================

  public forceMinSize(): void {
    const { size } = this;
    size.x = Math.max(MIN_BOX_SIZE, size.x);
    size.y = Math.max(MIN_BOX_SIZE, size.y);
    size.z = Math.max(MIN_BOX_SIZE, size.z);
  }

  public setFocusInteractive(focusType: FocusType, focusFace?: BoxFace): boolean {
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
    return true;
  }

  public static isValidSize(value: number): boolean {
    return value > MIN_BOX_SIZE;
  }
}
