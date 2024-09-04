/*!
 * Copyright 2024 Cognite AS
 */

import { BoxDomainObject } from '../primitives/box/BoxDomainObject';
import { Color } from 'three';
import { SolidPrimitiveRenderStyle } from '../primitives/SolidPrimitiveRenderStyle';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { AnnotationsDomainObject } from './AnnotationsDomainObject';
import { SingleAnnotation } from './helpers/SingleAnnotation';

export class BoxGizmoDomainObject extends BoxDomainObject {
  public static GizmoOnly = 'GizmoOnly';

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
    this.color = new Color(Color.NAMES.white);
  }
  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): TranslateKey {
    return { fallback: 'Box' };
  }

  public override createRenderStyle(): RenderStyle | undefined {
    const style = new SolidPrimitiveRenderStyle();
    style.showLabel = false;
    style.opacity = 0.333;
    return style;
  }

  public override get hasPanelInfo(): boolean {
    return true;
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new BoxGizmoDomainObject();
    clone.copyFrom(this, what);
    return clone;
  }

  protected override notifyCore(change: DomainObjectChange): void {
    super.notifyCore(change);

    // Update the selected annotation if the gizmo is moved
    const desc = change.getChangedDescription(Changes.geometry);
    if (desc !== undefined && !desc.isChanged(BoxGizmoDomainObject.GizmoOnly)) {
      this.updateSelectedAnnotationFromThis();
    }
  }

  // ==================================================
  // OVERRIDES of BoxDomainObject
  // ==================================================

  public override canRotateComponent(_component: number): boolean {
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public createSingleAnnotationBox(): SingleAnnotation {
    const matrix = this.getMatrix();
    return SingleAnnotation.createBoxFromMatrix(matrix);
  }

  public updateThisFromAnnotation(annotation: SingleAnnotation): boolean {
    const matrix = annotation.getMatrix();
    if (matrix === undefined) {
      return false;
    }
    this.setMatrix(matrix);
    return true;
  }

  private updateSelectedAnnotationFromThis(): boolean {
    const annotationDomainObject = this.getAncestorByType(AnnotationsDomainObject);
    if (annotationDomainObject === undefined) {
      return false;
    }
    const annotation = annotationDomainObject.selectedAnnotation;
    if (annotation === undefined) {
      return false;
    }
    annotation.updateFromMatrix(this.getMatrix());
    annotationDomainObject.notify(Changes.geometry);
    return true;
  }
}
