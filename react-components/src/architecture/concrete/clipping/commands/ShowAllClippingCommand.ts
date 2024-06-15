/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { VisualDomainObject } from '../../../base/domainObjects/VisualDomainObject';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { CropBoxDomainObject } from '../CropBoxDomainObject';
import { SliceDomainObject } from '../SliceDomainObject';

export class ShowAllClippingCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return {
      key: 'CLIP_SHOW_SELECTED_ONLY',
      fallback: 'Show or hide all other slicing planes and crop boxes than selected'
    };
  }

  public override get icon(): string {
    return 'EyeShow';
  }

  public override get isEnabled(): boolean {
    return this.isAny();
  }

  public override get isChecked(): boolean {
    return this.isAnyVisible();
  }

  protected override invokeCore(): boolean {
    const isVisible = this.isAnyVisible();
    for (const domainObject of this.getSelectable()) {
      if (domainObject.isSelected) {
        continue;
      }
      domainObject.setVisibleInteractive(!isVisible, this.renderTarget);
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private canBeSelected(domainObject: DomainObject): boolean {
    return domainObject instanceof CropBoxDomainObject || domainObject instanceof SliceDomainObject;
  }

  private *getSelectable(): Generator<VisualDomainObject> {
    const { rootDomainObject } = this;
    for (const domainObject of rootDomainObject.getDescendantsByType(VisualDomainObject)) {
      if (!this.canBeSelected(domainObject)) {
        continue;
      }
      yield domainObject;
    }
  }

  private isAnyVisible(): boolean {
    for (const domainObject of this.getSelectable()) {
      if (domainObject.isSelected) {
        continue;
      }
      if (domainObject.isVisible(this.renderTarget)) {
        return true;
      }
    }
    return false;
  }

  private isAny(): boolean {
    for (const domainObject of this.getSelectable()) {
      if (domainObject.isSelected) {
        continue;
      }
      return true;
    }
    return false;
  }
}
