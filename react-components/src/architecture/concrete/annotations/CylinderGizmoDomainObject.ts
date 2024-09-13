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
import { SolidDomainObject } from '../primitives/common/SolidDomainObject';
import { SolidPrimitiveRenderStyle } from '../primitives/common/SolidPrimitiveRenderStyle';
import { CYLINDER_RADIUS_MARGIN } from './utils/constants';
import { AnnotationChangedDescription } from './helpers/AnnotationChangedDescription';
import { type BaseCommand } from '../../base/commands/BaseCommand';
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
    style.opacity = 0.3333;
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
  // OVERRIDES of VisualDomainObject
  // ==================================================

  public override get useClippingInIntersection(): boolean {
    return false;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public createAnnotation(): SingleAnnotation {
    const { cylinder } = this;
    const radius = cylinder.radius / (1 + CYLINDER_RADIUS_MARGIN);
    return SingleAnnotation.createCylinder(cylinder.centerA, cylinder.centerB, radius);
  }

  public updateThisFromAnnotation(annotation: SingleAnnotation): boolean {
    const geometry = annotation.selectedGeometry;
    if (geometry === undefined) {
      return false;
    }
    const toCylinder = this.cylinder;
    const fromCylinder = geometry.cylinder;
    if (fromCylinder === undefined) {
      return false;
    }
    toCylinder.centerA.fromArray(fromCylinder.centerA);
    toCylinder.centerB.fromArray(fromCylinder.centerB);
    toCylinder.radius = fromCylinder.radius * (1 + CYLINDER_RADIUS_MARGIN);
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
    const geometry = annotation.selectedGeometry;
    if (geometry === undefined) {
      return false;
    }
    const toCylinder = geometry.cylinder;
    if (toCylinder === undefined) {
      return false;
    }
    const fromCylinder = this.cylinder;

    toCylinder.centerA = fromCylinder.centerA.toArray();
    toCylinder.centerB = fromCylinder.centerB.toArray();
    toCylinder.radius = fromCylinder.radius / (1 + CYLINDER_RADIUS_MARGIN);

    const change = inDragging ? Changes.dragging : Changes.changedPart;
    const changeDesc = new AnnotationChangedDescription(change, annotation);
    annotationDomainObject.notify(changeDesc);
    return true;
  }
}
