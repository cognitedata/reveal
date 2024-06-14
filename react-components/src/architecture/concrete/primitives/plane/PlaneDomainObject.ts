/*!
 * Copyright 2024 Cognite AS
 */

import { type RenderStyle } from '../../../base/domainObjectsHelpers/RenderStyle';
import { type ThreeView } from '../../../base/views/ThreeView';
import { PlaneView } from './PlaneView';
import { type Color, Plane } from 'three';
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
  // OVERRIDES of DomainObject
  // ==================================================

  public override get icon(): string {
    return getIconByPrimitiveType(this.primitiveType);
  }

  public override get typeName(): string {
    switch (this.primitiveType) {
      case PrimitiveType.XPlane:
        return 'Vertical plane along Y-axis';
      case PrimitiveType.YPlane:
        return 'Vertical plane along X-axis';
      case PrimitiveType.ZPlane:
        return 'Horizontal plane';
      case PrimitiveType.XYPlane:
        return 'Vertical plane';
      default:
        throw new Error('Unknown PrimitiveType');
    }
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new PlaneRenderStyle();
  }

  public override createDragger(props: CreateDraggerProps): BaseDragger | undefined {
    return new PlaneDragger(props, this);
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new PlaneView();
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  public get useClippingInIntersection(): boolean {
    return false;
  }

  // ==================================================
  // INSTANCE METHODS: Others
  // ==================================================

  public setFocusInteractive(focusType: FocusType): boolean {
    if (this.focusType === focusType) {
      return false;
    }
    this.focusType = focusType;
    this.notify(Changes.focus);
    return true;
  }
}
