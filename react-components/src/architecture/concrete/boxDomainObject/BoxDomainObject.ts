/*!
 * Copyright 2024 Cognite AS
 */

import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { BoxRenderStyle } from './BoxRenderStyle';
import { type RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';
import { type ThreeView } from '../../base/views/ThreeView';
import { BoxThreeView } from './BoxThreeView';
import { Matrix4, Vector3 } from 'three';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { BoxFace } from '../../base/utilities/box/BoxFace';
import { BoxFocusType } from '../../base/utilities/box/BoxFocusType';
import { type IBox } from '../../base/utilities/box/IBox';

export const MIN_BOX_SIZE = 0.01;

export class BoxDomainObject extends VisualDomainObject implements IBox {
  // ==================================================
  // INSTANCE FIELDS (This implements the IBox interface)
  // ==================================================

  public readonly size = new Vector3().setScalar(MIN_BOX_SIZE);
  public readonly center = new Vector3();
  public zRotation = 0; // Angle in radians in interval [0, 2*Pi>

  // For focus when edit in 3D
  public focusFace: BoxFace | undefined = undefined; // Used when hasFocus is true only
  public focusType: BoxFocusType = BoxFocusType.None;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get diagonal(): number {
    return this.size.length();
  }

  public get area(): number {
    return 2 * (this.size.x + this.size.y + this.size.z);
  }

  public get volume(): number {
    return this.size.x * this.size.y * this.size.z;
  }

  public get renderStyle(): BoxRenderStyle | undefined {
    return this.getRenderStyle() as BoxRenderStyle;
  }

  public get hasFocus(): boolean {
    return this.focusType !== BoxFocusType.None;
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  public override get typeName(): string {
    return 'Box';
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new BoxRenderStyle();
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new BoxThreeView();
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  forceMinSize(): void {
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
    return this.getScaledMatrix(this.size);
  }

  public getScaledMatrix(scale: Vector3, matrix: Matrix4 = new Matrix4()): Matrix4 {
    matrix = this.getRotationMatrix(matrix);
    matrix.setPosition(this.center);
    matrix.scale(scale);
    return matrix;
  }

  public setFocusInteractive(focusType: BoxFocusType, focusFace?: BoxFace): boolean {
    if (focusType === BoxFocusType.None) {
      if (this.focusType === BoxFocusType.None) {
        return false; // No change
      }
      this.focusType = BoxFocusType.None;
      this.focusFace = undefined; // Ignore input focusFace
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
}
