/*!
 * Copyright 2024 Cognite AS
 */

import { ShowAllDomainObjectsCommand } from '../../../base/commands/ShowAllDomainObjectsCommand';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { ExampleDomainObject } from '../ExampleDomainObject';

export class ShowAllExamplesCommand extends ShowAllDomainObjectsCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: 'Show or hide all examples' };
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return domainObject instanceof ExampleDomainObject;
  }
}
