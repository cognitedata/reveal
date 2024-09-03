/*!
 * Copyright 2024 Cognite AS
 */

import { BoxDomainObject } from '../primitives/box/BoxDomainObject';
import { Color, Vector3 } from 'three';
import { BoxRenderStyle } from '../primitives/box/BoxRenderStyle';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { AnnotationsDomainObject } from './AnnotationsDomainObject';
import { SingleAnnotation } from './helpers/SingleAnnotation';

export class AnnotationGizmoDomainObject extends BoxDomainObject {
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
    return { fallback: 'Annotation gizmo' };
  }

  public override createRenderStyle(): RenderStyle | undefined {
    const style = new BoxRenderStyle();
    style.showLabel = false;
    style.opacity = 0.333;
    return style;
  }

  public override get hasPanelInfo(): boolean {
    return true;
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new AnnotationGizmoDomainObject();
    clone.copyFrom(this, what);
    return clone;
  }

  protected override notifyCore(change: DomainObjectChange): void {
    super.notifyCore(change);

    const desc = change.getChangedDescription(Changes.geometry);
    if (desc !== undefined && !desc.isChanged(AnnotationGizmoDomainObject.GizmoOnly)) {
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
    if (annotation.isCylinder) {
      matrix.scale(new Vector3(2, 2, 2));
    }
    this.setMatrix(matrix);
    return true;
  }

  private updateSelectedAnnotationFromThis(): void {
    const annotationDomainObject = this.getAncestorByType(AnnotationsDomainObject);
    if (annotationDomainObject === undefined) {
      return;
    }
    const selectedAnnotation = annotationDomainObject.selectedAnnotation;
    if (selectedAnnotation === undefined) {
      return;
    }
    selectedAnnotation.updateFromMatrix(this.getMatrix());
    annotationDomainObject.notify(Changes.geometry);
  }
}
