/*!
 * Copyright 2024 Cognite AS
 */

import { Color } from 'three';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { AnnotationsDomainObject } from './AnnotationsDomainObject';
import { SingleAnnotation } from './helpers/SingleAnnotation';
import { CylinderDomainObject } from '../primitives/cylinder/CylinderDomainObject';
import { SolidDomainObject } from '../primitives/base/SolidDomainObject';
import { SolidPrimitiveRenderStyle } from '../primitives/base/SolidPrimitiveRenderStyle';
import { ANNOTATION_CYLINDER_RADIUS_MARGIN } from './utils/constants';
import { AnnotationChangedDescription } from './helpers/AnnotationChangedDescription';
import { BaseCommand } from '../../base/commands/BaseCommand';
import { CopyToClipboardCommand } from '../../base/concreteCommands/CopyToClipboardCommand';
import { ToggleMetricUnitsCommand } from '../../base/concreteCommands/ToggleMetricUnitsCommand';

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
    return { key: 'CYLINDER', fallback: 'Cylinder' };
  }

  public override createRenderStyle(): RenderStyle | undefined {
    const style = new SolidPrimitiveRenderStyle();
    style.showLabel = false;
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
    if (desc !== undefined && !desc.isChanged(SolidDomainObject.GizmoOnly)) {
      this.updateSelectedAnnotationFromThis(false);
    } else if (change.isChanged(Changes.dragging)) {
      this.updateSelectedAnnotationFromThis(true);
    }
  }

  public override getPanelToolbar(): BaseCommand[] {
    return [new CopyToClipboardCommand(), new ToggleMetricUnitsCommand()];
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public createAnnotation(): SingleAnnotation {
    const radius = this.radius / (1 + ANNOTATION_CYLINDER_RADIUS_MARGIN);
    return SingleAnnotation.createCylinder(this.centerA, this.centerB, radius);
  }

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
    this.radius = cylinder.radius * (1 + ANNOTATION_CYLINDER_RADIUS_MARGIN);
    return true;
  }

  private updateSelectedAnnotationFromThis(inDragging: boolean): boolean {
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
    const radius = this.radius / (1 + ANNOTATION_CYLINDER_RADIUS_MARGIN);

    cylinder.centerA = this.centerA.toArray();
    cylinder.centerB = this.centerB.toArray();
    cylinder.radius = radius;

    const change = inDragging ? Changes.dragging : Changes.changedPart;
    const changeDesc = new AnnotationChangedDescription(change, annotation);
    annotationDomainObject.notify(changeDesc);
    return true;
  }
}
