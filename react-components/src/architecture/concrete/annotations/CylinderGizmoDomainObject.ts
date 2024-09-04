/*!
 * Copyright 2024 Cognite AS
 */

import { Color } from 'three';
import { SolidPrimitiveRenderStyle } from '../primitives/SolidPrimitiveRenderStyle';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { AnnotationsDomainObject } from './AnnotationsDomainObject';
import { type SingleAnnotation } from './helpers/SingleAnnotation';
import { BoxGizmoDomainObject } from './BoxGizmoDomainObject';
import { CylinderDomainObject } from '../primitives/cylinder/CylinderDomainObject';

export class CylinderGizmoDomainObject extends CylinderDomainObject {
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
    return { fallback: 'Cylinder' };
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
    const clone = new CylinderGizmoDomainObject();
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
  // INSTANCE METHODS
  // ==================================================

  public updateThisFromAnnotation(annotation: SingleAnnotation): boolean {
    const geometry = annotation.geometry;
    if (geometry === undefined) {
      return false;
    }
    const cylinder = geometry.cylinder;
    if (cylinder === undefined) {
      return false;
    }
    const a = cylinder.centerA;
    const b = cylinder.centerB;
    this.centerA.set(a[0], a[1], a[2]);
    this.centerB.set(b[0], b[1], b[2]);
    this.radius = cylinder.radius;
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
    const geometry = annotation.geometry;
    if (geometry === undefined) {
      return false;
    }
    const cylinder = geometry.cylinder;
    if (cylinder === undefined) {
      return false;
    }
    cylinder.centerA = this.centerA.toArray();
    cylinder.centerB = this.centerB.toArray();
    cylinder.radius = this.radius;
    annotationDomainObject.notify(Changes.geometry);
    return true;
  }
}
