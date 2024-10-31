/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { AnnotationsDomainObject } from '../AnnotationsDomainObject';
import { SolidDomainObject } from '../../primitives/common/SolidDomainObject';
import { AnnotationChangedDescription } from '../helpers/AnnotationChangedDescription';
import { type IconName } from '../../../base/utilities/IconName';

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

  public override get icon(): IconName {
    return this._horizontal ? 'BorderHorizontal' : 'BorderVertical';
  }

  public override get isEnabled(): boolean {
    const domainObject = this.getAnnotationsDomainObject();
    return (
      domainObject !== undefined &&
      domainObject.selectedAnnotation !== undefined &&
      domainObject.selectedAnnotation.selectedPrimitive !== undefined
    );
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
    const annotation = domainObject.selectedAnnotation;
    if (annotation === undefined) {
      return false;
    }
    if (!annotation.align(this._horizontal)) {
      return false;
    }
    const change = new AnnotationChangedDescription(Changes.changedPart, annotation);
    domainObject.notify(change);

    const gizmo = domainObject.getGizmo();
    if (gizmo === undefined) {
      return true;
    }
    gizmo.updateThisFromAnnotation(annotation);
    const gizmoChange = new DomainObjectChange(Changes.geometry, SolidDomainObject.GizmoOnly);
    gizmo.notify(gizmoChange);
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getAnnotationsDomainObject(): AnnotationsDomainObject | undefined {
    return this.rootDomainObject.getSelectedDescendantByType(AnnotationsDomainObject);
  }
}
