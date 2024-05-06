/*!
 * Copyright 2024 Cognite AS
 */

import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { BoxRenderStyle } from './BoxRenderStyle';
import { type RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';
import { type ThreeView } from '../../base/views/ThreeView';
import { BoxThreeView } from './BoxThreeView';
import { type Matrix4, Vector3 } from 'three';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type BoxFace } from './BoxFace';

export class BoxDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly size = new Vector3(1, 1, 1);
  public readonly center = new Vector3();
  public readonly zRotation = 0;

  // For focus when edit in 3D
  private _hasFocus = false;
  private _focusFace: BoxFace | undefined = undefined; // Used when hasFocus is true only
  private _focusTranslate: boolean = false; // Used when hasFocus is true only

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get renderStyle(): BoxRenderStyle | undefined {
    return this.getRenderStyle() as BoxRenderStyle;
  }

  public get hasFocus(): boolean {
    return this._hasFocus;
  }

  public set hasFocus(value: boolean) {
    this._hasFocus = value;
  }

  public get focusFace(): BoxFace | undefined {
    return this._focusFace;
  }

  public get focusTranslate(): boolean {
    return this._focusTranslate;
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

  public getMatrix(matrix: Matrix4): Matrix4 {
    matrix.makeRotationZ(this.zRotation);
    matrix.setPosition(this.center.clone());
    matrix.scale(this.size.clone());
    return matrix;
  }

  public setFocusInteractive(hasFocus: boolean, face?: BoxFace, translate = false): boolean {
    if (!hasFocus) {
      // Ignore face and translate here
      if (hasFocus === this.hasFocus) {
        return false; // Nothing to do
      }

      this.hasFocus = false;
      this._focusFace = undefined;
      this._focusTranslate = false;
    } else {
      if (
        hasFocus === this.hasFocus &&
        this.focusFace === face &&
        this.focusTranslate === translate
      ) {
        return false; // Nothing to do
      }
      this.hasFocus = true;
      this._focusFace = face;
      this._focusTranslate = translate;
    }
    this.notify(Changes.focus);
    return true;
  }
}
