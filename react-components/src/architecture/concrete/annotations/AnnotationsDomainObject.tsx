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
import { AnnotationGizmoDomainObject } from './AnnotationGizmoDomainObject';

export class AnnotationsDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public annotations: PointCloudAnnotation[] = [];

  public selectedAnnotation: PointCloudAnnotation | undefined = undefined;
  public selectedGeometry = undefined;

  public focusAnnotation?: PointCloudAnnotation | undefined = undefined;

  public focusType = FocusType.None;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get style(): AnnotationsRenderStyle {
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
  // INSTANCE METHODS; Interactive operations
  // ==================================================

  public removeSelectedAnnotationInteractive(): boolean {
    if (this.selectedAnnotation === undefined) {
      return false;
    }
    if (this.annotations === undefined) {
      return false;
    }
    const isChanged = remove(this.annotations, this.selectedAnnotation);
    this.selectedAnnotation = undefined;
    if (isChanged) {
      this.notify(Changes.geometry);
      const annotationGizmo = this.getAnnotationGizmo();
      if (annotationGizmo !== undefined) {
        annotationGizmo.removeInteractive();
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

  public setSelectedAnnotationInteractive(annotation: PointCloudAnnotation | undefined): boolean {
    if (this.selectedAnnotation === annotation) {
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
    focusAnnotation?: PointCloudAnnotation
  ): boolean {
    if (focusAnnotation === this.focusAnnotation && focusType === this.focusType) {
      return false; // No change
    }
    this.focusType = focusType;
    this.focusAnnotation = focusAnnotation;
    this.notify(Changes.focus);
    return true;
  }

  public getAnnotationGizmo(): AnnotationGizmoDomainObject | undefined {
    return this.getDescendantByType(AnnotationGizmoDomainObject);
  }

  public getOrCreateAnnotationGizmo(): AnnotationGizmoDomainObject {
    let annotationGizmo = this.getAnnotationGizmo();
    if (annotationGizmo === undefined) {
      annotationGizmo = new AnnotationGizmoDomainObject();
      this.addChildInteractive(annotationGizmo);
    }
    return annotationGizmo;
  }
}
