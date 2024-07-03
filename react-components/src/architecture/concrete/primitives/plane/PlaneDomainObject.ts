/*!
 * Copyright 2024 Cognite AS
 */

import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';
import { type ThreeView } from '../../../base/views/ThreeView';
import { PlaneView } from './PlaneView';
import { type Color, Plane, Vector3 } from 'three';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { PrimitiveType } from '../PrimitiveType';
import { type BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import {
  VisualDomainObject,
  type CreateDraggerProps
} from '../../../base/domainObjects/VisualDomainObject';
import { PlaneRenderStyle } from './PlaneRenderStyle';
import { PlaneDragger } from './PlaneDragger';
import { getIconByPrimitiveType } from '../../measurements/getIconByPrimitiveType';
import { getComplementary } from '../../../base/utilities/colors/colorExtensions';
import {
  horizontalAngle,
  rotateHorizontal
} from '../../../base/utilities/extensions/vectorExtensions';
import { forceBetween0AndPi } from '../../../base/utilities/extensions/mathExtensions';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { PanelInfo } from '../../../base/domainObjectsHelpers/PanelInfo';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { radToDeg } from 'three/src/math/MathUtils.js';
import { type DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';
import { DomainObjectTransaction } from '../../../base/undo/DomainObjectTransaction';
import { type Transaction } from '../../../base/undo/Transaction';
import { type IconName } from '../../../../components/Architecture/getIconComponent';

const ORIGIN = new Vector3(0, 0, 0);

export abstract class PlaneDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly plane = new Plane();
  private readonly _primitiveType: PrimitiveType;
  private _backSideColor: Color | undefined = undefined;

  // For focus when edit in 3D (Used when isSelected is true only)
  public focusType: FocusType = FocusType.None;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get renderStyle(): PlaneRenderStyle {
    return this.getRenderStyle() as PlaneRenderStyle;
  }

  public get primitiveType(): PrimitiveType {
    return this._primitiveType;
  }

  public get backSideColor(): Color {
    if (this._backSideColor === undefined) {
      this._backSideColor = getComplementary(this.color);
    }
    return this._backSideColor;
  }

  public set backSideColor(color: Color) {
    this._backSideColor = color;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(primitiveType: PrimitiveType) {
    super();
    this._primitiveType = primitiveType;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): IconName {
    return getIconByPrimitiveType(this.primitiveType);
  }

  public override get typeName(): TranslateKey {
    switch (this.primitiveType) {
      case PrimitiveType.PlaneX:
        return { key: 'PLANE_X', fallback: 'Vertical plane along Y-axis' };
      case PrimitiveType.PlaneY:
        return { key: 'PLANE_Y', fallback: 'Vertical plane along X-axis' };
      case PrimitiveType.PlaneZ:
        return { key: 'PLANE_Z', fallback: 'Horizontal plane' };
      case PrimitiveType.PlaneXY:
        return { key: 'PLANE_XY', fallback: 'Vertical plane' };
      default:
        throw new Error('Unknown PrimitiveType');
    }
  }

  public override get isLegal(): boolean {
    return this.focusType !== FocusType.Pending;
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new PlaneRenderStyle();
  }

  public override createDragger(props: CreateDraggerProps): BaseDragger | undefined {
    return new PlaneDragger(props, this);
  }

  public override get hasPanelInfo(): boolean {
    return true;
  }

  public override getPanelInfo(): PanelInfo | undefined {
    const info = new PanelInfo();
    info.setHeader(this.typeName);

    switch (this.primitiveType) {
      case PrimitiveType.PlaneX:
        add('XCOORDINATE', 'X coordinate', this.coordinate, Quantity.Length);
        break;
      case PrimitiveType.PlaneY:
        add('YCOORDINATE', 'Y coordinate', this.coordinate, Quantity.Length);
        break;
      case PrimitiveType.PlaneZ:
        add('ZCOORDINATE', 'Z coordinate', this.coordinate, Quantity.Length);
        break;
      case PrimitiveType.PlaneXY:
        add('DISTANCE_TO_ORIGIN', 'Distance to origin', this.coordinate, Quantity.Length);
        add('ANGLE', 'Angle', radToDeg(this.angle), Quantity.Angle);
        break;
    }
    return info;

    function add(key: string, fallback: string, value: number, quantity: Quantity): void {
      info.add({ key, fallback, value, quantity });
    }
  }

  protected override notifyCore(change: DomainObjectChange): void {
    super.notifyCore(change);

    if (change.isChanged(Changes.added)) {
      this.makeFlippingConsistent();
    }
  }

  protected override createThreeView(): ThreeView | undefined {
    return new PlaneView();
  }

  public override createTransaction(changed: symbol): Transaction {
    return new DomainObjectTransaction(this, changed);
  }

  public override copyFrom(domainObject: PlaneDomainObject, what?: symbol): void {
    super.copyFrom(domainObject, what);
    if (what === undefined || what === Changes.geometry) {
      this.plane.copy(domainObject.plane);
    }
    if (what === undefined || what === Changes.color) {
      this._backSideColor = domainObject._backSideColor?.clone();
    }
  }

  // ==================================================
  // INSTANCE METHODS / PROPERTIES: Geometrical getters
  // ==================================================

  public get coordinate(): number {
    const pointOnPlane = this.plane.projectPoint(ORIGIN, new Vector3());
    switch (this.primitiveType) {
      case PrimitiveType.PlaneX:
        return pointOnPlane.x;
      case PrimitiveType.PlaneY:
        return pointOnPlane.y;
      case PrimitiveType.PlaneZ:
        return pointOnPlane.z;
      case PrimitiveType.PlaneXY:
        return pointOnPlane.distanceTo(ORIGIN);
      default:
        throw new Error('Unknown PrimitiveType');
    }
  }

  public get angle(): number {
    const vector = this.plane.normal.clone();
    rotateHorizontal(vector, Math.PI / 2);
    const angle = horizontalAngle(vector);
    return forceBetween0AndPi(angle);
  }

  // ==================================================
  // INSTANCE METHODS: Others
  // ==================================================

  public setFocusInteractive(focusType: FocusType): boolean {
    if (this.focusType === focusType) {
      return false;
    }
    const changeFromPending =
      this.focusType === FocusType.Pending && focusType !== FocusType.Pending;
    this.focusType = focusType;
    this.notify(Changes.focus);
    if (changeFromPending) {
      this.notify(Changes.geometry);
    }
    return true;
  }

  public flip(): void {
    const { plane } = this;
    plane.normal.negate();
    plane.constant = -plane.constant;
  }

  public makeFlippingConsistent(): void {
    const root = this.rootDomainObject;
    if (root === undefined) {
      return;
    }
    for (const other of root.getDescendantsByType(PlaneDomainObject)) {
      if (this.primitiveType !== other.primitiveType) {
        continue;
      }
      if (this === other) {
        continue;
      }
      const origin = new Vector3(0, 0, 0);
      const pointOnThisPlane = this.plane.projectPoint(origin, new Vector3());
      if (other.plane.distanceToPoint(pointOnThisPlane) < 0) {
        other.flip();
        other.notify(Changes.geometry);
      }
      const pointOnOtherPlane = other.plane.projectPoint(origin, new Vector3());
      if (this.plane.distanceToPoint(pointOnOtherPlane) < 0) {
        this.flip();
        this.notify(Changes.geometry);
      }
      break;
    }
  }
}
