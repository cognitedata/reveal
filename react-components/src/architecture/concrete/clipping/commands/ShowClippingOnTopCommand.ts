/*!
 * Copyright 2024 Cognite AS
 */

import { ShowDomainObjectsOnTopCommand } from '../../../base/commands/ShowDomainObjectsOnTopCommand';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { CropBoxDomainObject } from '../CropBoxDomainObject';
import { SliceDomainObject } from '../SliceDomainObject';

export class ShowClippingOnTopCommand extends ShowDomainObjectsOnTopCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): string {
    return 'Flag';
  }

  public override get tooltip(): TranslateKey {
    return { key: 'CLIP_SHOW_ON_TOP', fallback: 'Show all crop boxes and slices on top' };
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return domainObject instanceof CropBoxDomainObject || domainObject instanceof SliceDomainObject;
  }
}
