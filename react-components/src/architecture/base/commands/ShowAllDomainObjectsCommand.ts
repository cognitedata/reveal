/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateKey } from '../utilities/TranslateKey';
import { InstanceCommand } from './InstanceCommand';

export abstract class ShowAllDomainObjectsCommand extends InstanceCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'EXAMPLES_SHOW', fallback: 'Show or hide' };
  }

  public override get icon(): string {
    return 'EyeShow';
  }

  public override get isChecked(): boolean {
    return this.isAnyVisible();
  }

  protected override invokeCore(): boolean {
    const isVisible = this.isAnyVisible();
    for (const domainObject of this.getInstances()) {
      domainObject.setVisibleInteractive(!isVisible, this.renderTarget);
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private isAnyVisible(): boolean {
    for (const domainObject of this.getInstances()) {
      if (domainObject.isVisible(this.renderTarget)) {
        return true;
      }
    }
    return false;
  }
}
