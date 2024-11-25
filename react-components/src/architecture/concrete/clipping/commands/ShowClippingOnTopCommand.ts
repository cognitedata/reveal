/*!
 * Copyright 2024 Cognite AS
 */

import { ShowDomainObjectsOnTopCommand } from '../../../base/commands/ShowDomainObjectsOnTopCommand';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { CropBoxDomainObject } from '../CropBoxDomainObject';
import { SliceDomainObject } from '../SliceDomainObject';

export class ShowClippingOnTopCommand extends ShowDomainObjectsOnTopCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'CLIP_SHOW_ON_TOP' };
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return domainObject instanceof CropBoxDomainObject || domainObject instanceof SliceDomainObject;
  }
}
