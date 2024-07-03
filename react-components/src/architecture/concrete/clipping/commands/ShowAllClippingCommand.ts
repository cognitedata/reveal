/*!
 * Copyright 2024 Cognite AS
 */

import { IconName } from '../../../../components/Architecture/getIconComponent';
import { InstanceCommand } from '../../../base/commands/InstanceCommand';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { CropBoxDomainObject } from '../CropBoxDomainObject';
import { SliceDomainObject } from '../SliceDomainObject';

export class ShowAllClippingCommand extends InstanceCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return {
      key: 'CLIP_SHOW_SELECTED_ONLY',
      fallback: 'Show or hide all other slicing planes and crop boxes than selected'
    };
  }

  public override get icon(): IconName {
    return 'EyeShow';
  }

  public override get isChecked(): boolean {
    return this.isAnyVisible();
  }

  protected override invokeCore(): boolean {
    const isVisible = this.isAnyVisible();
    for (const domainObject of this.getInstances()) {
      if (domainObject.isSelected) {
        continue;
      }
      domainObject.setVisibleInteractive(!isVisible, this.renderTarget);
    }
    return true;
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return domainObject instanceof CropBoxDomainObject || domainObject instanceof SliceDomainObject;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private isAnyVisible(): boolean {
    for (const domainObject of this.getInstances()) {
      if (domainObject.isSelected) {
        continue;
      }
      if (domainObject.isVisible(this.renderTarget)) {
        return true;
      }
    }
    return false;
  }
}
