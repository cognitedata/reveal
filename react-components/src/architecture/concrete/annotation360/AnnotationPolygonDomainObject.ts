/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { FocusType } from '../../base/domainObjectsHelpers/FocusType';
import { PanelInfo } from '../../base/domainObjectsHelpers/PanelInfo';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { LineDomainObject } from '../primitives/line/LineDomainObject';
import { Color } from 'three';
import { LineRenderStyle } from '../primitives/line/LineRenderStyle';

export class AnnotationPolygonDomainObject extends LineDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super(PrimitiveType.Polygon);
    this.color = new Color(Color.NAMES.red);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get typeName(): TranslateKey {
    return { fallback: 'Annotation polygon' };
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new AnnotationPolygonDomainObject();
    clone.copyFrom(this, what);
    return clone;
  }

  public override get hasPanelInfo(): boolean {
    return false;
  }

  public override getPanelInfo(): PanelInfo | undefined {
    if (this.focusType === FocusType.Pending && this.points.length <= 1) {
      return undefined;
    }
    const info = new PanelInfo();
    info.setHeader(this.typeName);
    return info;
  }

  public override createRenderStyle(): RenderStyle | undefined {
    const style = new LineRenderStyle();
    style.showLabel = false;
    // style.lineWidth = 4;
    // style.selectedLineWidth = style.lineWidth * 2;
    style.pipeRadius = 0.01;
    style.selectedPipeRadius = 2 * style.pipeRadius;
    return style;
  }
}
