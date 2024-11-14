/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { LineDomainObject } from '../primitives/line/LineDomainObject';
import { Color, Vector3 } from 'three';
import { LineRenderStyle } from '../primitives/line/LineRenderStyle';
import { type DirectRelationReference } from '@cognite/sdk';

export class Image360AnnotationDomainObject extends LineDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public connectedImageId: string | DirectRelationReference;
  public readonly center = new Vector3(); // The points are unit vectors from the center

  public constructor(connectedImageId: string | DirectRelationReference) {
    super(PrimitiveType.Polygon);
    this.color = new Color(Color.NAMES.red);
    this.connectedImageId = connectedImageId;
  }

  public override getTransformedPoint(point: Vector3): Vector3 {
    return this.getCopyOfTransformedPoint(point);
  }

  public override getCopyOfTransformedPoint(point: Vector3): Vector3 {
    const clone = this.center.clone();
    clone.addScaledVector(point, 5);
    return point;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get typeName(): TranslateKey {
    return { fallback: 'Annotation polygon' };
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new Image360AnnotationDomainObject(this.connectedImageId);
    clone.copyFrom(this, what);
    return clone;
  }

  public override get hasPanelInfo(): boolean {
    return false;
  }

  public override createRenderStyle(): RenderStyle | undefined {
    const style = new LineRenderStyle();
    style.showLabel = false;
    style.pipeRadius = 0.01;
    style.selectedPipeRadius = 2 * style.pipeRadius;
    style.depthTest = false;
    style.transparent = true; // Needed to make the line visible through other objects
    return style;
  }
}
