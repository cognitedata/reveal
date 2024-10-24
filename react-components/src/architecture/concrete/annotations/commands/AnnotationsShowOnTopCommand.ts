/*!
 * Copyright 2024 Cognite AS
 */

import { ShowDomainObjectsOnTopCommand } from '../../../base/commands/ShowDomainObjectsOnTopCommand';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { isAnnotationsOrGizmo } from './isGizmo';

export class AnnotationsShowOnTopCommand extends ShowDomainObjectsOnTopCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'ANNOTATIONS_SHOW_ON_TOP', fallback: 'Show all annotations on top.' };
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return isAnnotationsOrGizmo(domainObject);
  }
}
