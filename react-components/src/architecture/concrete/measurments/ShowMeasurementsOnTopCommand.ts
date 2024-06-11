/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { MeasureBoxDomainObject } from './MeasureBoxDomainObject';
import { MeasureLineDomainObject } from './MeasureLineDomainObject';

export class ShowMeasurementsOnTopCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'MEASUREMENTS_SHOW_ON_TOP', fallback: 'Show all measurements on top' };
  }

  public override get icon(): string {
    return 'EyeShow';
  }

  public override get isEnabled(): boolean {
    return this.getFirst() !== undefined;
  }

  public override get isChecked(): boolean {
    return !this.getDepthTest();
  }

  protected override invokeCore(): boolean {
    const depthTest = this.getDepthTest();
    for (const domainObject of this.rootDomainObject.getDescendants()) {
      if (domainObject instanceof MeasureBoxDomainObject) {
        const style = domainObject.renderStyle;
        style.depthTest = !depthTest;
        domainObject.notify(Changes.renderStyle);
      } else if (domainObject instanceof MeasureLineDomainObject) {
        const style = domainObject.renderStyle;
        style.depthTest = !depthTest;
        domainObject.notify(Changes.renderStyle);
      }
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getDepthTest(): boolean {
    const domainObject = this.getFirst();
    if (domainObject === undefined) {
      return false;
    }
    const style = domainObject.renderStyle;
    return style.depthTest;
  }

  private getFirst(): MeasureBoxDomainObject | MeasureLineDomainObject | undefined {
    for (const domainObject of this.rootDomainObject.getDescendants()) {
      if (domainObject instanceof MeasureBoxDomainObject) {
        return domainObject;
      }
      if (domainObject instanceof MeasureLineDomainObject) {
        return domainObject;
      }
    }
    return undefined;
  }
}
