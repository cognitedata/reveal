/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */

import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { ExampleDomainObject } from '../ExampleDomainObject';

export class ShowExamplesOnTopCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'EXAMPLES_SHOW_ON_TOP', fallback: 'Show all examples on top' };
  }

  public override get icon(): string {
    return 'EyeShow';
  }

  public override get isEnabled(): boolean {
    const domainObject = this.rootDomainObject.getDescendantByType(ExampleDomainObject);
    return domainObject !== undefined;
  }

  public override get isChecked(): boolean {
    return !this.getDepthTest();
  }

  protected override invokeCore(): boolean {
    const depthTest = this.getDepthTest();
    for (const domainObject of this.rootDomainObject.getDescendantsByType(ExampleDomainObject)) {
      const style = domainObject.renderStyle;
      style.depthTest = !depthTest;
      domainObject.notify(Changes.renderStyle);
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getDepthTest(): boolean {
    const domainObject = this.rootDomainObject.getDescendantByType(ExampleDomainObject);
    if (domainObject === undefined) {
      return false;
    }
    return domainObject.renderStyle.depthTest;
  }
}
