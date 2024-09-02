/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { AnnotationGizmoDomainObject } from '../AnnotationGizmoDomainObject';
import { AnnotationsDomainObject } from '../AnnotationsDomainObject';

export class AlignSelectedAnnotationCommand extends RenderTargetCommand {
  private readonly _horizontal: boolean;

  // ==================================================
  // OVERRIDES
  // ==================================================

  public constructor(horizontal: boolean) {
    super();
    this._horizontal = horizontal;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    if (this._horizontal) {
      return {
        key: 'ANNOTATIONS_ALIGN_HORIZONTALLY',
        fallback: 'Align selected annotation horizontally'
      };
    } else {
      return {
        key: 'ANNOTATIONS_ALIGN_VERTICALLY',
        fallback: 'Align selected annotation vertically'
      };
    }
  }

  public override get icon(): string {
    return this._horizontal ? 'BorderHorizontal' : 'BorderVertical';
  }

  public override get isEnabled(): boolean {
    const domainObject = this.getAnnotationsDomainObject();
    return domainObject !== undefined && domainObject.selectedAnnotation !== undefined;
  }

  public override equals(other: BaseCommand): boolean {
    if (!(other instanceof AlignSelectedAnnotationCommand)) {
      return false;
    }
    return this._horizontal === other._horizontal;
  }

  protected override invokeCore(): boolean {
    const domainObject = this.getAnnotationsDomainObject();
    if (domainObject === undefined) {
      return false;
    }
    const { selectedAnnotation } = domainObject;
    if (selectedAnnotation === undefined) {
      return false;
    }
    if (!selectedAnnotation.align(this._horizontal)) {
      return false;
    }
    domainObject.notify(Changes.geometry);

    const annotationGizmo = domainObject.getAnnotationGizmo();
    if (annotationGizmo !== undefined) {
      annotationGizmo.updateThisFromAnnotation(selectedAnnotation);
      const change = new DomainObjectChange(
        Changes.geometry,
        AnnotationGizmoDomainObject.GizmoOnly
      );
      annotationGizmo.notify(change);
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getAnnotationsDomainObject(): AnnotationsDomainObject | undefined {
    return this.rootDomainObject.getSelectedDescendantByType(AnnotationsDomainObject);
  }
}
