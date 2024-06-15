/*!
 * Copyright 2024 Cognite AS
 */

import { BoxDomainObject } from '../primitives/box/BoxDomainObject';
import { Color, type Vector3 } from 'three';
import { BoxRenderStyle } from '../primitives/box/BoxRenderStyle';
import { type RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';
import { type TranslateKey } from '../../base/utilities/TranslateKey';

export class GizmoBoxDomainObject extends BoxDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(center: Vector3, size: Vector3, zRotation: number) {
    super();
    this.center.copy(center);
    this.size.copy(size);
    this.zRotation = zRotation;
    this.color = new Color(Color.NAMES.white);
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): TranslateKey {
    return { key: 'GIZMO_BOX', fallback: 'Gizmo box' };
  }

  public override createRenderStyle(): RenderStyle | undefined {
    const style = new BoxRenderStyle();
    style.showLabel = false;
    return style;
  }

  public override get hasPanelInfo(): boolean {
    return false;
  }
}
