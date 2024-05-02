/*!
 * Copyright 2024 Cognite AS
 */

import { VisualDomainObject } from '../domainObjects/VisualDomainObject';
import { BoxRenderStyle } from './BoxRenderStyle';
import { type RenderStyle } from '../utilities/misc/RenderStyle';
import { type ThreeView } from '../views/ThreeView';
import { BoxThreeView } from './BoxThreeView';
import { Matrix4, Vector3 } from 'three';

export class BoxDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly scale: Vector3 = new Vector3(1, 1, 1);
  public readonly center: Vector3 = new Vector3(0, 0, 0);
  public readonly zRotation: number = 0;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get matrix(): Matrix4 {
    const matrix = new Matrix4();
    matrix.makeRotationZ(this.zRotation);
    matrix.setPosition(this.center.clone());
    matrix.scale(this.scale.clone());
    return matrix;
  }

  public get renderStyle(): BoxRenderStyle | undefined {
    return this.getRenderStyle() as BoxRenderStyle;
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
}
