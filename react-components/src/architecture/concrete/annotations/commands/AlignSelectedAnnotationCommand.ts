/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
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
    const { geometry } = selectedAnnotation;
    if (geometry === undefined) {
      return false;
    }

    if (geometry.box !== undefined) {
      return false;
    }

    if (geometry.cylinder !== undefined) {
      const cylinder = geometry.cylinder;
      if (this._horizontal) {
        const z = (cylinder.centerA[2] + cylinder.centerB[2]) / 2;
        cylinder.centerA[2] = z;
        cylinder.centerB[2] = z;
      } else {
        const x = (cylinder.centerA[0] + cylinder.centerB[0]) / 2;
        cylinder.centerA[0] = x;
        cylinder.centerB[0] = x;
        const y = (cylinder.centerA[1] + cylinder.centerB[1]) / 2;
        cylinder.centerA[1] = y;
        cylinder.centerB[1] = y;
      }
    }
    domainObject.notify(Changes.geometry);
    const annotationGizmo = domainObject.getAnnotationGizmo();
    if (annotationGizmo !== undefined) {
      annotationGizmo.updateThisFromAnnotation(selectedAnnotation);
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
