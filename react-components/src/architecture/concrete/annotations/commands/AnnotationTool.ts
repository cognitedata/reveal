/*!
 * Copyright 2024 Cognite AS
 */

import { type AnyIntersection } from '@cognite/reveal';
import { type VisualDomainObject } from '../../../base/domainObjects/VisualDomainObject';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { AnnotationsDomainObject } from '../AnnotationsDomainObject';
import { BaseEditTool } from '../../../base/commands/BaseEditTool';
import { isDomainObjectIntersection } from '../../../base/domainObjectsHelpers/DomainObjectIntersection';
import { type PointCloudAnnotation } from '../utils/types';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { Matrix4 } from 'three';
import { PendingAnnotation } from '../utils/PendingAnnotation';

export const ANNOTATION_RADIUS_FACTOR = 0.2;

export class AnnotationTool extends BaseEditTool {
  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): string {
    return 'Edit';
  }

  public override get tooltip(): TranslateKey {
    return { fallback: 'Create or edit annotations' };
  }

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override onKey(event: KeyboardEvent, down: boolean): void {
    if (down && (event.key === 'Delete' || event.key === 'Backspace')) {
      const domainObject = this.getSelected();
      if (domainObject instanceof AnnotationsDomainObject) {
        // this.addTransaction(domainObject.createTransaction(Changes.deleted));
        domainObject.removeSelectedInteractive();
      }
      return;
    }
    super.onKey(event, down);
  }

  public override async onHover(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);
    const domainObject = getSelectedAnnotationsDomainObject(intersection);
    const annotation = getSelectedAnnotation(intersection);
    if (domainObject !== undefined && annotation !== undefined) {
      this.renderTarget.setMoveCursor();
      domainObject.setFocusInteractive(FocusType.Focus, annotation);
    } else if (intersection !== undefined) {
      this.renderTarget.setCrosshairCursor();
      this.defocusAll();
    } else {
      this.renderTarget.setNavigateCursor();
      this.defocusAll();
    }
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      await super.onClick(event);
      return;
    }
    {
      // Try to select an annotation
      const domainObject = getSelectedAnnotationsDomainObject(intersection);
      const annotation = getSelectedAnnotation(intersection);
      if (domainObject !== undefined && annotation !== undefined) {
        domainObject.setSelectedAnnotationInteractive(annotation);
        return;
      }
    }
    // Try to make a new annotation
    const domainObject = this.getSelected() as AnnotationsDomainObject;
    if (domainObject === undefined) {
      return;
    }
    const distance = intersection.distanceToCamera;
    const scale = (distance * ANNOTATION_RADIUS_FACTOR) / 2;
    const center = intersection.point.clone();

    const matrix = new Matrix4();
    matrix.makeScale(scale, scale, scale);
    matrix.setPosition(center);

    const pendingAnnotation = new PendingAnnotation(matrix);
    domainObject.setSelectedAnnotationInteractive(undefined);
    domainObject.setPendingAnnotationInteractive(pendingAnnotation);

    // this.addTransaction(domainObject.createTransaction(Changes.added));
    this.renderTarget.setMoveCursor();
  }

  // ==================================================
  // OVERRIDES of BaseEditTool
  // ==================================================

  protected override canBeSelected(domainObject: VisualDomainObject): boolean {
    return domainObject instanceof AnnotationsDomainObject;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private defocusAll(except?: DomainObject | undefined): void {
    for (const domainObject of this.getSelectable()) {
      if (except !== undefined && domainObject === except) {
        continue;
      }
      if (domainObject instanceof AnnotationsDomainObject) {
        domainObject.setFocusInteractive(FocusType.None);
      }
    }
  }
}

// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

function getSelectedAnnotation(
  intersection: AnyIntersection | undefined
): PointCloudAnnotation | undefined {
  if (intersection === undefined) {
    return undefined;
  }
  if (!isDomainObjectIntersection(intersection)) {
    return undefined;
  }
  return intersection.userData as PointCloudAnnotation;
}

function getSelectedAnnotationsDomainObject(
  intersection: AnyIntersection | undefined
): AnnotationsDomainObject | undefined {
  if (intersection === undefined) {
    return undefined;
  }
  if (!isDomainObjectIntersection(intersection)) {
    return undefined;
  }
  const { domainObject } = intersection;
  if (!(domainObject instanceof AnnotationsDomainObject)) {
    return undefined;
  }
  return domainObject;
}
