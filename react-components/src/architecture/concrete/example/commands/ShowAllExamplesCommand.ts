/*!
 * Copyright 2024 Cognite AS
 */

import { ShowAllDomainObjectsCommand } from '../../../base/commands/ShowAllDomainObjectsCommand';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { ExampleDomainObject } from '../ExampleDomainObject';

export class ShowAllExamplesCommand extends ShowAllDomainObjectsCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Show or hide all examples' };
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return domainObject instanceof ExampleDomainObject;
  }
}
