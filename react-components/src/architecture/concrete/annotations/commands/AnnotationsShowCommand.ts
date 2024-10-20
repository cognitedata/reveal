/*!
 * Copyright 2024 Cognite AS
 */

import { ShowAllDomainObjectsCommand } from '../../../base/commands/ShowAllDomainObjectsCommand';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { isAnnotationsOrGizmo } from './isGizmo';

export class AnnotationsShowCommand extends ShowAllDomainObjectsCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'ANNOTATIONS_SHOW_OR_HIDE', fallback: 'Show or hide annotations.' };
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return isAnnotationsOrGizmo(domainObject);
  }
}
