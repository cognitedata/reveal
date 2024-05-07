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
import { type BoxFace } from './BoxFace';
import { BoxFocusType } from './BoxFocusType';

export class BoxDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly size = new Vector3(1, 1, 1);
  public readonly center = new Vector3();
  public zRotation = 0;

  // For focus when edit in 3D
  private _focusFace: BoxFace | undefined = undefined; // Used when hasFocus is true only
  private _focusType: BoxFocusType = BoxFocusType.None;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get renderStyle(): BoxRenderStyle | undefined {
    return this.getRenderStyle() as BoxRenderStyle;
  }

  public get hasFocus(): boolean {
    return this.focusType !== BoxFocusType.None;
  }

  public get focusFace(): BoxFace | undefined {
    return this._focusFace;
  }

  public get focusType(): BoxFocusType {
    return this._focusType;
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

  public getRotatationMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    matrix.makeRotationZ(this.zRotation);
    return matrix;
  }

  public getMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    matrix = this.getRotatationMatrix(matrix);
    matrix.setPosition(this.center);
    matrix.scale(this.size);
    return matrix;
  }

  public setFocusInteractive(type: BoxFocusType, face?: BoxFace): boolean {
    if (type === BoxFocusType.None) {
      if (this.focusType === BoxFocusType.None) {
        return false; // No change
      }
      this._focusType = BoxFocusType.None;
      this._focusFace = undefined; // Ignore input face
    } else {
      if (type === this.focusType && this.focusFace === face) {
        return false; // No change
      }
      this._focusType = type;
      this._focusFace = face;
    }
    this.notify(Changes.focus);
    return true;
  }
}
