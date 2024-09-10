/*!
 * Copyright 2024 Cognite AS
 */

import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type ThreeView } from '../../base/views/ThreeView';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { type PointCloudAnnotation } from './utils/types';
import { AnnotationsView } from './AnnotationsView';
import { AnnotationsRenderStyle } from './AnnotationsRenderStyle';
import { FocusType } from '../../base/domainObjectsHelpers/FocusType';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { remove } from '../../base/utilities/extensions/arrayExtensions';
import { BoxGizmoDomainObject } from './BoxGizmoDomainObject';
import { SingleAnnotation } from './helpers/SingleAnnotation';
import { SolidDomainObject } from '../primitives/base/SolidDomainObject';
import { PrimitiveType } from '../primitives/PrimitiveType';
import { CylinderGizmoDomainObject } from './CylinderGizmoDomainObject';
import { getStatusByAnnotation } from './utils/getStatusByAnnotation';
import { AnnotationChangedDescription } from './helpers/AnnotationChangedDescription';
import { DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';

export class AnnotationsDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public annotations: PointCloudAnnotation[] = [];
  public selectedAnnotation: SingleAnnotation | undefined = undefined;
  public focusAnnotation?: SingleAnnotation | undefined = undefined;
  public pendingAnnotation: SingleAnnotation | undefined = undefined;
  public focusType = FocusType.None;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get renderStyle(): AnnotationsRenderStyle {
    return super.getRenderStyle() as AnnotationsRenderStyle;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get icon(): string {
    return 'Cube';
  }

  public override get typeName(): TranslateKey {
    return { fallback: 'Annotations' };
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new AnnotationsRenderStyle();
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new AnnotationsView();
  }

  // ==================================================
  // INSTANCE METHODS: Interactive operations
  // ==================================================

  public removeSelectedAnnotationInteractive(): boolean {
    if (this.selectedAnnotation === undefined) {
      return false;
    }
    if (this.annotations === undefined) {
      return false;
    }
    let isChanged: boolean;
    if (!this.selectedAnnotation.isSingle) {
      isChanged = this.selectedAnnotation.removeGeometry();
    } else {
      isChanged = remove(this.annotations, this.selectedAnnotation.annotation);
    }
    if (isChanged) {
      const change = new AnnotationChangedDescription(Changes.deletedPart, this.selectedAnnotation);
      this.notify(change);
      const gizmo = this.getGizmo();
      if (gizmo !== undefined) {
        gizmo.removeInteractive(false);
      }
    }
    this.selectedAnnotation = undefined;
    return isChanged;
  }

  public override setSelectedInteractive(value: boolean): boolean {
    if (this.isSelected === value) {
      return false; // no change
    }
    this.isSelected = value;
    this.notify(Changes.selected);
    return true;
  }

  public setSelectedAnnotationInteractive(annotation: SingleAnnotation | undefined): boolean {
    if (SingleAnnotation.areEqual(this.selectedAnnotation, annotation)) {
      return false;
    }
    this.selectedAnnotation = annotation;
    if (this.selectedAnnotation !== undefined) {
      this.setSelectedInteractive(true);
    }
    this.setFocusAnnotationInteractive(FocusType.None);
    this.notify(Changes.selected);
    return true;
  }

  public setFocusAnnotationInteractive(
    focusType: FocusType,
    annotation?: SingleAnnotation
  ): boolean {
    if (
      SingleAnnotation.areEqual(this.focusAnnotation, annotation) &&
      this.focusType === focusType
    ) {
      return false; // No change
    }
    this.focusType = focusType;
    this.focusAnnotation = annotation;
    this.notify(Changes.focus);
    return true;
  }

  public applyPendingAnnotationInteractive(): boolean {
    if (this.pendingAnnotation === undefined) {
      return false;
    }
    this.annotations.push(this.pendingAnnotation.annotation);
    this.notify(new AnnotationChangedDescription(Changes.addedPart, this.pendingAnnotation));
    this.setSelectedAnnotationInteractive(this.pendingAnnotation);

    const gizmo = this.getOrCreateGizmoByAnnotation(this.pendingAnnotation);
    if (gizmo !== undefined) {
      const change = new DomainObjectChange(Changes.geometry, SolidDomainObject.GizmoOnly);
      change.addChange(Changes.color);
      gizmo.notify(change);
      gizmo.setFocusInteractive(FocusType.Body);
      gizmo.setSelectedInteractive(true);
    }
    this.pendingAnnotation = undefined;
    return true;
  }

  public cancelPendingAnnotationInteractive(): boolean {
    if (this.pendingAnnotation === undefined) {
      return false;
    }
    const gizmo = this.getGizmo();
    if (gizmo !== undefined) {
      gizmo.removeInteractive(false);
    }
    this.pendingAnnotation = undefined;
    return true;
  }

  // ==================================================
  // INSTANCE METHODS: Get or create the gizmo
  // ==================================================

  public getGizmo(): SolidDomainObject | undefined {
    return this.getDescendantByType(SolidDomainObject);
  }

  private getOrCreateGizmo(primitiveType: PrimitiveType): SolidDomainObject | undefined {
    const gizmo = this.getGizmo();
    if (gizmo !== undefined && gizmo.primitiveType === primitiveType) {
      return gizmo;
    }
    if (gizmo !== undefined) {
      gizmo.removeInteractive(false);
    }
    const newGizmo = createGizmo(primitiveType);
    if (newGizmo !== undefined) {
      this.addChildInteractive(newGizmo);
    }
    return newGizmo;
  }

  public getOrCreateGizmoByAnnotation(annotation: SingleAnnotation): SolidDomainObject | undefined {
    const gizmo = this.getOrCreateGizmo(annotation.primitiveType);
    if (gizmo === undefined) {
      return undefined;
    }
    if (gizmo instanceof BoxGizmoDomainObject || gizmo instanceof CylinderGizmoDomainObject) {
      if (!gizmo.updateThisFromAnnotation(annotation)) {
        return undefined;
      }
    }
    const renderStyle = this.renderStyle;
    const gizmoRenderStyle = gizmo.renderStyle;

    gizmoRenderStyle.opacity = 0.3333;
    gizmoRenderStyle.showLines = false;
    gizmoRenderStyle.lineWidth = 1;
    gizmoRenderStyle.depthTest = renderStyle.depthTest;
    gizmo.color.set(
      this.renderStyle.getColorByStatus(getStatusByAnnotation(annotation.annotation))
    );
    return gizmo;
  }

  public getOrCreateGizmoForPending(primitiveType: PrimitiveType): SolidDomainObject | undefined {
    const gizmo = this.getOrCreateGizmo(primitiveType);
    if (gizmo === undefined) {
      return undefined;
    }
    gizmo.clear();

    const renderStyle = this.renderStyle;
    const gizmoRenderStyle = gizmo.renderStyle;

    gizmoRenderStyle.opacity = 0.3333;
    gizmoRenderStyle.showLines = true;
    gizmoRenderStyle.lineWidth = renderStyle.selectedLineWidth;
    gizmoRenderStyle.depthTest = renderStyle.depthTest;
    gizmo.color.set(renderStyle.pendingColor);
    return gizmo;
  }
}

// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

function createGizmo(primitiveType: PrimitiveType): SolidDomainObject | undefined {
  switch (primitiveType) {
    case PrimitiveType.Box:
      return new BoxGizmoDomainObject();
    case PrimitiveType.Cylinder:
      return new CylinderGizmoDomainObject();
    default:
      return undefined;
  }
}
