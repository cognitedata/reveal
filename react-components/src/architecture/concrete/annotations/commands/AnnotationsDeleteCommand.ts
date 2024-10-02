/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { AnnotationsDomainObject } from '../AnnotationsDomainObject';

export class AnnotationsDeleteCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'ANNOTATIONS_DELETE', fallback: 'Delete selected annotations' };
  }

  public override get icon(): string {
    return 'Delete';
  }

  public override get buttonType(): string {
    return 'ghost-destructive';
  }

  public override get isEnabled(): boolean {
    const domainObject = this.getAnnotationsDomainObject();
    return domainObject !== undefined && domainObject.selectedAnnotation !== undefined;
  }

  protected override invokeCore(): boolean {
    const domainObject = this.getAnnotationsDomainObject();
    if (domainObject === undefined) {
      return false;
    }
    return domainObject.removeSelectedAnnotationInteractive();
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getAnnotationsDomainObject(): AnnotationsDomainObject | undefined {
    return this.rootDomainObject.getSelectedDescendantByType(AnnotationsDomainObject);
  }
}
