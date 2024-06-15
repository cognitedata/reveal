/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { ShowPrimitivesOnTopCommand } from '../../primitives/ShowPrimitivesOnTopCommand';
import { ExampleDomainObject } from '../ExampleDomainObject';

export class ShowExamplesOnTopCommand extends ShowPrimitivesOnTopCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'EXAMPLES_SHOW_ON_TOP', fallback: 'Show all examples on top' };
  }

  public override get icon(): string {
    return 'Flag';
  }

  protected override canBeSelected(domainObject: DomainObject): boolean {
    return domainObject instanceof ExampleDomainObject;
  }
}
