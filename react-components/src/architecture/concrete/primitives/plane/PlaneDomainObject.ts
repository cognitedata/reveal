/*!
 * Copyright 2024 Cognite AS
 */

import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';
import { type ThreeView } from '../../../base/views/ThreeView';
import { PlaneView } from './PlaneView';
import { type Color, Plane, Vector3 } from 'three';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { type BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import {
  VisualDomainObject,
  type CreateDraggerProps
} from '../../../base/domainObjects/VisualDomainObject';
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
import { type IconName } from '../../../base/utilities/IconName';
import { SolidPrimitiveRenderStyle } from '../common/SolidPrimitiveRenderStyle';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';

const ORIGIN = new Vector3(0, 0, 0);

export abstract class PlaneDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly plane = new Plane();
  private readonly _primitiveType: PrimitiveType;
  private _backSideColor: Color | undefined = undefined;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get renderStyle(): SolidPrimitiveRenderStyle {
    return this.getRenderStyle() as SolidPrimitiveRenderStyle;
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
        return { fallback: 'Vertical plane along Y-axis' };
      case PrimitiveType.PlaneY:
        return { fallback: 'Vertical plane along X-axis' };
      case PrimitiveType.PlaneZ:
        return { fallback: 'Horizontal plane' };
      case PrimitiveType.PlaneXY:
        return { fallback: 'Vertical plane' };
      default:
        throw new Error('Unknown PrimitiveType');
    }
  }

  public override createRenderStyle(): RenderStyle | undefined {
    const style = new SolidPrimitiveRenderStyle();
    style.selectedOpacity = 0.5;
    style.opacity = style.selectedOpacity / 2;
    style.lineWidth = 1;
    style.selectedLineWidth = 2;
    return style;
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
  // OVERRIDES of VisualDomainObject
  // ==================================================

  public override getEditToolCursor(
    _renderTarget: RevealRenderTarget,
    _point?: Vector3
  ): string | undefined {
    return 'move';
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
