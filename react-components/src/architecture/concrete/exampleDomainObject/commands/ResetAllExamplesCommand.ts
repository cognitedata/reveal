/*!
 * Copyright 2024 Cognite AS
 */

import { ExampleDomainObject } from '../ExampleDomainObject';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { InstanceCommand } from '../../../base/commands/InstanceCommand';

export class ResetAllExamplesCommand extends InstanceCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return {
      key: 'EXAMPLES_RESET',
      fallback: 'Reset the visual style for all examples to default'
    };
  }

  public override get icon(): string {
    return 'ClearAll';
  }

  protected override invokeCore(): boolean {
    for (const domainObject of this.getInstances()) {
      domainObject.setRenderStyle(undefined);
      domainObject.notify(Changes.renderStyle);
    }
    return true;
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return domainObject instanceof ExampleDomainObject;
  }
}
