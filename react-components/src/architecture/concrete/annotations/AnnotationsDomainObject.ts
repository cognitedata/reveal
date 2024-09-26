/*!
 * Copyright 2024 Cognite AS
 */

import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type ThreeView } from '../../base/views/ThreeView';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { AnnotationsView } from './AnnotationsView';
import { AnnotationsRenderStyle } from './AnnotationsRenderStyle';
import { FocusType } from '../../base/domainObjectsHelpers/FocusType';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { remove } from '../../base/utilities/extensions/arrayExtensions';
import { BoxGizmoDomainObject } from './BoxGizmoDomainObject';
import { SolidDomainObject } from '../primitives/common/SolidDomainObject';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { CylinderGizmoDomainObject } from './CylinderGizmoDomainObject';
import { AnnotationChangedDescription } from './helpers/AnnotationChangedDescription';
import { DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { AnnotationUtils } from './helpers/AnnotationUtils';
import { Annotation } from './helpers/Annotation';

export class AnnotationsDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _annotations: Annotation[] = [];
  private _focusType = FocusType.None;

  public selectedAnnotation: Annotation | undefined = undefined;
  public focusAnnotation?: Annotation | undefined = undefined;
  public pendingAnnotation: Annotation | undefined = undefined;
  public applyPendingWhenCreated = false;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get annotations(): Annotation[] {
    return this._annotations;
  }

  public set annotations(annotations: Annotation[]) {
    this._annotations = annotations;

    // The pointer may have so refresh all
    if (this.selectedAnnotation !== undefined) {
      this.selectedAnnotation = this.selectedAnnotation.remap(annotations);
      if (this.selectedAnnotation === undefined) {
        this.removeGizmoInteractive();
      }
    }
    if (this.focusAnnotation !== undefined) {
      this.focusAnnotation = this.focusAnnotation.remap(annotations);
    }
    if (this.pendingAnnotation !== undefined) {
      this.pendingAnnotation = this.pendingAnnotation.remap(annotations);
      if (this.pendingAnnotation === undefined) {
        this.removeGizmoInteractive();
      }
    }
    const gizmo = this.getGizmo();
    if (gizmo !== undefined) {
      gizmo.notify(Changes.geometry);
    }
    this.notify(Changes.geometry);
  }

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
      isChanged = this.selectedAnnotation.removeSelectedPrimitive();
      if (isChanged) {
        const change = new AnnotationChangedDescription(
          Changes.changedPart,
          this.selectedAnnotation
        );
        this.notify(change);
        this.removeGizmoInteractive();
      }
    } else {
      isChanged = remove(this.annotations, this.selectedAnnotation);
      if (isChanged) {
        const change = new AnnotationChangedDescription(
          Changes.deletedPart,
          this.selectedAnnotation
        );
        this.notify(change);
        this.removeGizmoInteractive();
        this.selectedAnnotation = undefined;
      }
    }
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

  public setSelectedAnnotationInteractive(
    annotation?: Annotation,
    primitiveIndex?: number,
    updateGizmo = true
  ): boolean {
    if (Annotation.areEqualIncludeSelected(this.selectedAnnotation, annotation, primitiveIndex)) {
      return false;
    }
    this.selectedAnnotation = annotation;
    if (this.selectedAnnotation !== undefined) {
      this.selectedAnnotation.selectedIndex = primitiveIndex;
      this.setSelectedInteractive(true);
    }
    this.setFocusAnnotationInteractive(FocusType.None);
    this.notify(Changes.selected);

    if (updateGizmo) {
      if (annotation !== undefined) {
        const gizmo = this.getOrCreateGizmoByAnnotation(annotation);
        if (gizmo !== undefined) {
          const change = new DomainObjectChange(Changes.geometry, SolidDomainObject.GizmoOnly);
          change.addChange(Changes.color);
          gizmo.notify(change);
          gizmo.setFocusInteractive(FocusType.Body);
          gizmo.setSelectedInteractive(true);
          gizmo.setVisibleInteractive(true);
        }
      } else {
        this.removeGizmoInteractive();
      }
    }
    return true;
  }

  public setFocusAnnotationInteractive(focusType: FocusType, annotation?: Annotation): boolean {
    if (Annotation.areEqual(this.focusAnnotation, annotation) && this._focusType === focusType) {
      return false; // No change
    }
    this._focusType = focusType;
    this.focusAnnotation = annotation;
    this.notify(Changes.focus);
    return true;
  }

  public applyPendingAnnotationInteractive(annotation?: Annotation): boolean {
    if (this.pendingAnnotation === undefined) {
      return false;
    }
    if (annotation !== undefined) {
      this.pendingAnnotation = annotation;
    }
    this.annotations.push(this.pendingAnnotation);
    this.notify(new AnnotationChangedDescription(Changes.addedPart, this.pendingAnnotation));
    this.setSelectedAnnotationInteractive(this.pendingAnnotation, 0);
    this.setVisibleInteractive(true);
    this.pendingAnnotation = undefined;
    return true;
  }

  public cancelPendingAnnotationInteractive(): boolean {
    if (this.pendingAnnotation === undefined) {
      return false;
    }
    this.removeGizmoInteractive();
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

    if (
      primitiveType === PrimitiveType.HorizontalCylinder ||
      primitiveType === PrimitiveType.VerticalCylinder
    ) {
      primitiveType = PrimitiveType.Cylinder;
    }
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

  public getOrCreateGizmoByAnnotation(annotation: Annotation): SolidDomainObject | undefined {
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

    gizmoRenderStyle.showLines = true;
    gizmoRenderStyle.lineWidth = renderStyle.lineWidth;
    gizmoRenderStyle.selectedLineWidth = renderStyle.selectedLineWidth;
    gizmoRenderStyle.depthTest = renderStyle.depthTest;
    gizmo.color.set(renderStyle.getColorByStatus(annotation.getStatus()));
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

    gizmoRenderStyle.showLines = true;
    gizmoRenderStyle.lineWidth = renderStyle.lineWidth;
    gizmoRenderStyle.selectedLineWidth = renderStyle.selectedLineWidth;
    gizmoRenderStyle.depthTest = false;
    gizmo.color.set(renderStyle.pendingColor);
    return gizmo;
  }

  public removeGizmoInteractive(): void {
    const gizmo = this.getGizmo();
    if (gizmo !== undefined) {
      gizmo.removeInteractive(false);
    }
  }

  // ==================================================
  // INSTANCE METHODS: Create, update, delete
  // ==================================================

  public fetch(modelId: number): boolean {
    const rootDomainObject = this.rootDomainObject;
    if (rootDomainObject === undefined) {
      return false;
    }
    void AnnotationUtils.fetchAllAnnotations(rootDomainObject.sdk, modelId).then((_annotations) => {
      // this.annotations = annotations;
      this.setSelectedInteractive(true);
      this.setVisibleInteractive(true);
      this.notify(Changes.loaded);
    });
    return true;
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
